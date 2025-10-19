import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Get all budgets or specific budget
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const kodeAdsId = searchParams.get('kodeAdsId');
    const sumberLeadsId = searchParams.get('sumberLeadsId');
    const periode = searchParams.get('periode');

    let where: any = {};
    
    if (kodeAdsId) where.kodeAdsId = parseInt(kodeAdsId);
    if (sumberLeadsId) where.sumberLeadsId = parseInt(sumberLeadsId);
    if (periode) where.periode = periode;

    const budgets = await prisma.adsBudget.findMany({
      where,
      include: {
        kodeAds: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: budgets,
    });
  } catch (error) {
    console.error('Error fetching ads budgets:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch ads budgets',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST - Create or update budget
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { kodeAdsId, sumberLeadsId, budget, spent, periode, createdBy } = body;

    if (!kodeAdsId || !sumberLeadsId || !periode) {
      return NextResponse.json(
        { success: false, error: 'kodeAdsId, sumberLeadsId, and periode are required' },
        { status: 400 }
      );
    }

    // Check if budget already exists for this combination
    const existing = await prisma.adsBudget.findUnique({
      where: {
        kodeAdsId_sumberLeadsId_periode: {
          kodeAdsId: parseInt(kodeAdsId),
          sumberLeadsId: parseInt(sumberLeadsId),
          periode,
        },
      },
    });

    let result;
    let historyRecorded = false;
    
    if (existing) {
      // Update existing budget
      const newBudgetAmount = budget !== undefined ? parseFloat(budget) : existing.budget;
      const newSpentAmount = spent !== undefined ? parseFloat(spent) : existing.spent;
      
      result = await prisma.adsBudget.update({
        where: {
          id: existing.id,
        },
        data: {
          budget: newBudgetAmount,
          spent: newSpentAmount,
          updatedBy: createdBy || existing.updatedBy,
        },
        include: {
          kodeAds: true,
        },
      });

      // Record history for budget increase
      if (budget !== undefined && newBudgetAmount !== existing.budget) {
        const budgetDifference = newBudgetAmount - existing.budget;
        const budgetHistory = ((result.budgetHistory as any[]) || []);
        budgetHistory.push({
          id: Date.now(),
          type: 'budget',
          amount: budgetDifference,
          note: `Budget adjustment from ${existing.budget} to ${newBudgetAmount}`,
          createdBy: createdBy || 'System',
          createdAt: new Date().toISOString(),
        });
        
        await prisma.adsBudget.update({
          where: { id: existing.id },
          data: { budgetHistory },
        });
        historyRecorded = true;
      }

      // Record history for spent increase
      if (spent !== undefined && newSpentAmount !== existing.spent) {
        const spentDifference = newSpentAmount - existing.spent;
        const spentHistory = ((result.spentHistory as any[]) || []);
        spentHistory.push({
          id: Date.now() + 1, // Ensure unique ID
          type: 'spend',
          amount: spentDifference,
          note: `Spend adjustment from ${existing.spent} to ${newSpentAmount}`,
          createdBy: createdBy || 'System',
          createdAt: new Date().toISOString(),
        });
        
        await prisma.adsBudget.update({
          where: { id: existing.id },
          data: { spentHistory },
        });
        historyRecorded = true;
      }
    } else {
      // Create new budget
      const newBudgetAmount = budget ? parseFloat(budget) : 0;
      const newSpentAmount = spent ? parseFloat(spent) : 0;
      
      result = await prisma.adsBudget.create({
        data: {
          kodeAdsId: parseInt(kodeAdsId),
          sumberLeadsId: parseInt(sumberLeadsId),
          budget: newBudgetAmount,
          spent: newSpentAmount,
          periode,
          createdBy: createdBy || 'System',
          updatedBy: createdBy || 'System',
        },
        include: {
          kodeAds: true,
        },
      });

      // Record initial history
      if (newBudgetAmount > 0) {
        const budgetHistory = [{
          id: Date.now(),
          type: 'budget',
          amount: newBudgetAmount,
          note: `Initial budget created`,
          createdBy: createdBy || 'System',
          createdAt: new Date().toISOString(),
        }];
        
        await prisma.adsBudget.update({
          where: { id: result.id },
          data: { budgetHistory },
        });
      }

      if (newSpentAmount > 0) {
        const spentHistory = [{
          id: Date.now() + 1,
          type: 'spend',
          amount: newSpentAmount,
          note: `Initial spend recorded`,
          createdBy: createdBy || 'System',
          createdAt: new Date().toISOString(),
        }];
        
        await prisma.adsBudget.update({
          where: { id: result.id },
          data: { spentHistory },
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: existing ? 'Budget updated successfully' : 'Budget created successfully',
      historyRecorded,
    });
  } catch (error) {
    console.error('Error creating/updating ads budget:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create/update ads budget',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT - Update spent amount
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, spent, updatedBy } = body;

    if (!id || spent === undefined) {
      return NextResponse.json(
        { success: false, error: 'id and spent are required' },
        { status: 400 }
      );
    }

    // Get current budget to calculate difference
    const currentBudget = await prisma.adsBudget.findUnique({
      where: { id: parseInt(id) },
    });

    if (!currentBudget) {
      return NextResponse.json(
        { success: false, error: 'Budget not found' },
        { status: 404 }
      );
    }

    const newSpentAmount = parseFloat(spent as string);
    const spentDifference = newSpentAmount - currentBudget.spent;

    const result = await prisma.adsBudget.update({
      where: {
        id: parseInt(id),
      },
      data: {
        spent: newSpentAmount,
        updatedBy: updatedBy || 'System',
      },
      include: {
        kodeAds: true,
      },
    });

    // Record spend history
    if (spentDifference !== 0) {
      const spentHistory = ((result.spentHistory as any[]) || []);
      spentHistory.push({
        id: Date.now(),
        type: 'spend',
        amount: spentDifference,
        note: `Spend update from ${currentBudget.spent} to ${newSpentAmount}`,
        createdBy: updatedBy || 'System',
        createdAt: new Date().toISOString(),
      });

      await prisma.adsBudget.update({
        where: { id: parseInt(id) },
        data: { spentHistory },
      });
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Spent updated successfully',
    });
  } catch (error) {
    console.error('Error updating ads spent:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update ads spent',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete budget
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'id is required' },
        { status: 400 }
      );
    }

    await prisma.adsBudget.delete({
      where: {
        id: parseInt(id),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Budget deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting ads budget:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete ads budget',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
