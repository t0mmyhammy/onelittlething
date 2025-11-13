import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';

interface ParsedItem {
  label: string;
  quantity?: string;
  assignedToName?: string;
}

interface ParsedCategory {
  title: string;
  items: ParsedItem[];
}

export async function POST(req: Request) {
  try {
    const { packListId, categories, childrenMap } = await req.json();

    // Verify user is authenticated
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify pack list exists and user has access to it
    const { data: packList, error: packListError } = await supabase
      .from('pack_lists')
      .select('id, family_id')
      .eq('id', packListId)
      .single();

    if (packListError || !packList) {
      return new Response(JSON.stringify({ error: 'Pack list not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Verify user belongs to the family
    const { data: familyMember } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', user.id)
      .eq('family_id', packList.family_id)
      .single();

    if (!familyMember) {
      return new Response(JSON.stringify({ error: 'User not in family' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Categories array is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get existing categories for this pack list
    const { data: existingCategories } = await supabase
      .from('pack_list_categories')
      .select('id, title, order_index')
      .eq('pack_list_id', packListId);

    let totalItemsAdded = 0;

    // Add items to categories
    for (let i = 0; i < categories.length; i++) {
      const category: ParsedCategory = categories[i];

      // Try to find existing category by title (case-insensitive)
      const existingCategory = existingCategories?.find(
        (ec) => ec.title.toLowerCase() === category.title.toLowerCase()
      );

      let categoryId: string;

      if (existingCategory) {
        // Use existing category
        categoryId = existingCategory.id;
      } else {
        // Create new category
        const maxOrderIndex = existingCategories?.length
          ? Math.max(...existingCategories.map((ec) => ec.order_index))
          : -1;

        const { data: newCategory, error: categoryError } = await supabase
          .from('pack_list_categories')
          .insert({
            pack_list_id: packListId,
            title: category.title,
            order_index: maxOrderIndex + 1 + i,
          })
          .select()
          .single();

        if (categoryError) {
          console.error('Error creating category:', categoryError);
          continue;
        }

        categoryId = newCategory.id;
      }

      // Create items for this category
      if (category.items && category.items.length > 0) {
        // Get existing items count to set proper order_index
        const { count: existingItemsCount } = await supabase
          .from('pack_list_items')
          .select('*', { count: 'exact', head: true })
          .eq('category_id', categoryId);

        const startOrderIndex = existingItemsCount || 0;

        const itemsData = category.items.map((item: ParsedItem, j: number) => {
          // Map assignedToName to actual child ID if available
          let assignedTo = null;
          let assignedType: 'child' | 'parent' | 'all' | null = null;

          if (item.assignedToName && childrenMap && childrenMap[item.assignedToName]) {
            // It's a child
            assignedTo = childrenMap[item.assignedToName];
            assignedType = 'child';
          } else if (item.assignedToName) {
            // It's a parent/adult (Mom, Dad, etc.)
            assignedType = 'parent';
          } else {
            // No assignment means it's for all/shared
            assignedType = 'all';
          }

          return {
            category_id: categoryId,
            label: item.label,
            quantity: item.quantity || null,
            assigned_to: assignedTo,
            assigned_type: assignedType,
            is_complete: false,
            order_index: startOrderIndex + j,
          };
        });

        const { error: itemsError } = await supabase
          .from('pack_list_items')
          .insert(itemsData);

        if (itemsError) {
          console.error('Error creating items:', itemsError);
        } else {
          totalItemsAdded += itemsData.length;
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        itemsAdded: totalItemsAdded,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Import pack list items API error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
