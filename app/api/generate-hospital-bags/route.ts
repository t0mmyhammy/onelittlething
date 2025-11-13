import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { getHospitalBagTemplates } from '@/lib/hospital-bag-templates';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { familyId, hasOlderChildren } = await request.json();

    if (!familyId) {
      return NextResponse.json({ error: 'Family ID is required' }, { status: 400 });
    }

    // Verify user is a member of this family
    const { data: familyMember } = await supabase
      .from('family_members')
      .select('id')
      .eq('family_id', familyId)
      .eq('user_id', user.id)
      .single();

    if (!familyMember) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get appropriate hospital bag templates based on family context
    const bagTemplates = getHospitalBagTemplates(hasOlderChildren || false);

    const createdPackListIds: string[] = [];

    // Create each hospital bag pack list
    for (const bagTemplate of bagTemplates) {
      // Create the pack list
      const { data: packList, error: packListError } = await supabase
        .from('pack_lists')
        .insert({
          family_id: familyId,
          name: bagTemplate.name,
          duration_days: null, // Hospital bags don't have a set duration
          created_by_user_id: user.id,
        })
        .select()
        .single();

      if (packListError || !packList) {
        console.error('Error creating pack list:', packListError);
        continue;
      }

      createdPackListIds.push(packList.id);

      // Create categories and items for this pack list
      for (let categoryIndex = 0; categoryIndex < bagTemplate.categories.length; categoryIndex++) {
        const category = bagTemplate.categories[categoryIndex];

        // Create the category
        const { data: createdCategory, error: categoryError } = await supabase
          .from('pack_list_categories')
          .insert({
            pack_list_id: packList.id,
            title: category.title,
            order_index: categoryIndex,
          })
          .select()
          .single();

        if (categoryError || !createdCategory) {
          console.error('Error creating category:', categoryError);
          continue;
        }

        // Create items for this category
        const itemsToInsert = category.items.map((item, itemIndex) => ({
          category_id: createdCategory.id,
          label: item.notes ? `${item.label} (${item.notes})` : item.label,
          quantity: item.quantity || null,
          order_index: itemIndex,
          is_complete: false,
        }));

        const { error: itemsError } = await supabase
          .from('pack_list_items')
          .insert(itemsToInsert);

        if (itemsError) {
          console.error('Error creating items:', itemsError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      packListIds: createdPackListIds,
      message: `Successfully created ${createdPackListIds.length} hospital bag pack lists`,
    });
  } catch (error) {
    console.error('Error generating hospital bags:', error);
    return NextResponse.json(
      { error: 'Failed to generate hospital bags' },
      { status: 500 }
    );
  }
}
