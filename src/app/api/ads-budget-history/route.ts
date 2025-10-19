import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Get budget history for a specific ads budget
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const adsBudgetId = searchParams.get('adsBudgetId');
    const type = searchParams.get('type'); // 'budget', 'spend', or null for all

    if (!adsBudgetId) {
      return NextResponse.json(
        { success: false, error: 'adsBudgetId is required' },
        { status: 400 }
      );
    }

    // Get budget record with history
    const budget = await prisma.adsBudget.findUnique({
      where: {
        id: parseInt(adsBudgetId),
      },
    });

    if (!budget) {
      return NextResponse.json(
        { success: false, error: 'Budget not found' },
        { status: 404 }
      );
    }

    // Combine history based on type filter
    let history: any[] = [];

    if (type === 'spend') {
      history = (budget.spentHistory as any[]) || [];
    } else if (type === 'budget') {
      history = (budget.budgetHistory as any[]) || [];
    } else {
      // Return all history sorted by date (newest first)
      const budgetHist = (budget.budgetHistory as any[]) || [];
      const spentHist = (budget.spentHistory as any[]) || [];
      history = [...budgetHist, ...spentHist].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return NextResponse.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error('Error fetching budget history:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch budget history',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST - Add budget history record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adsBudgetId, type, amount, note, createdBy } = body;

    if (!adsBudgetId || !type || amount === undefined) {
      return NextResponse.json(
        { success: false, error: 'adsBudgetId, type, and amount are required' },
        { status: 400 }
      );
    }

    if (!['budget', 'spend'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'type must be "budget" or "spend"' },
        { status: 400 }
      );
    }

    // Get current budget
    const budget = await prisma.adsBudget.findUnique({
      where: { id: parseInt(adsBudgetId) },
    });

    if (!budget) {
      return NextResponse.json(
        { success: false, error: 'Budget not found' },
        { status: 404 }
      );
    }

    // Create new history entry
    const newEntry = {
      id: Date.now(),
      type,
      amount: parseFloat(amount as string),
      note: note || null,
      createdBy: createdBy || 'System',
      createdAt: new Date().toISOString(),
    };

    // Update appropriate history array
    if (type === 'budget') {
      const budgetHistory = ((budget.budgetHistory as any[]) || []);
      budgetHistory.push(newEntry);
      
      await prisma.adsBudget.update({
        where: { id: parseInt(adsBudgetId) },
        data: {
          budgetHistory: budgetHistory,
        },
      });
    } else if (type === 'spend') {
      const spentHistory = ((budget.spentHistory as any[]) || []);
      spentHistory.push(newEntry);
      
      await prisma.adsBudget.update({
        where: { id: parseInt(adsBudgetId) },
        data: {
          spentHistory: spentHistory,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: newEntry,
    });
  } catch (error) {
    console.error('Error creating budget history:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create budget history',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
