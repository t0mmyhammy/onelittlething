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
    const { familyId, userId, packListName, durationDays, participants, categories, childrenMap } = await req.json();

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

    // Verify user belongs to the family
    const { data: familyMember } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', user.id)
      .eq('family_id', familyId)
      .single();

    if (!familyMember) {
      return new Response(JSON.stringify({ error: 'User not in family' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!packListName || !packListName.trim()) {
      return new Response(
        JSON.stringify({ error: 'Pack list name is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!categories || !Array.isArray(categories) || categories.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Categories array is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create the pack list
    const { data: packList, error: packListError } = await supabase
      .from('pack_lists')
      .insert({
        family_id: familyId,
        created_by_user_id: userId,
        name: packListName.trim(),
        duration_days: durationDays ? parseInt(durationDays) : null,
        participants: participants || [],
      })
      .select()
      .single();

    if (packListError) {
      console.error('Error creating pack list:', packListError);
      return new Response(
        JSON.stringify({ error: 'Failed to create pack list' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create categories with items
    for (let i = 0; i < categories.length; i++) {
      const category: ParsedCategory = categories[i];

      // Create category
      const { data: newCategory, error: categoryError } = await supabase
        .from('pack_list_categories')
        .insert({
          pack_list_id: packList.id,
          title: category.title,
          order_index: i,
        })
        .select()
        .single();

      if (categoryError) {
        console.error('Error creating category:', categoryError);
        continue;
      }

      // Create items for this category
      if (category.items && category.items.length > 0) {
        const itemsData = category.items.map((item: ParsedItem, j: number) => {
          // Map assignedToName to actual child ID if available
          let assignedTo = null;
          let assignedType: 'child' | 'parent' | 'all' | null = null;

          if (item.assignedToName && childrenMap && childrenMap[item.assignedToName]) {
            // It's a child
            assignedTo = childrenMap[item.assignedToName];
            assignedType = 'child';
          } else if (item.assignedToName) {
            // It's a parent/adult (Mom, Dad, etc.) - for now, leave as null
            // Future: could map to user IDs
            assignedType = 'parent';
          } else {
            // No assignment means it's for all/shared
            assignedType = 'all';
          }

          return {
            category_id: newCategory.id,
            label: item.label,
            quantity: item.quantity || null,
            assigned_to: assignedTo,
            assigned_type: assignedType,
            is_complete: false,
            order_index: j,
          };
        });

        const { error: itemsError } = await supabase
          .from('pack_list_items')
          .insert(itemsData);

        if (itemsError) {
          console.error('Error creating items:', itemsError);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        packListId: packList.id,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Import pack list API error:', error);
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
