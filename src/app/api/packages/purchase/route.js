import { NextResponse } from 'next/server';
import { sessionDb, userSubscriptionsDb, packagesDb } from '@/lib/database';

export async function POST(request) {
  try {
    const sessionToken = request.cookies.get('session_token')?.value;
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await sessionDb.findValid(sessionToken);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    const { package_id } = await request.json();
    
    if (!package_id) {
      return NextResponse.json(
        { error: 'package_id is required' },
        { status: 400 }
      );
    }

    // Verify package exists
    const pkg = await packagesDb.getById(package_id);
    
    if (!pkg) {
      return NextResponse.json(
        { error: 'Invalid package_id' },
        { status: 404 }
      );
    }

    // Check if user is on Pro plan
    const subscription = await userSubscriptionsDb.getCurrent(user.id);
    
    if (!subscription || subscription.plan_name !== 'Pro') {
      return NextResponse.json(
        { error: 'You must be on Pro plan to purchase packages. Please upgrade first.' },
        { status: 403 }
      );
    }

    // ------------------- TODO: Integrate payment gateway here -------------------
    // For now, we'll just assign the package
    // In production, this should only happen after successful payment

    // Purchase the package
    await userSubscriptionsDb.purchasePackage(user.id, package_id);

    return NextResponse.json({
      success: true,
      message: `Successfully purchased ${pkg.name} package!`,
      package: {
        name: pkg.name,
        generations: pkg.credits,
        sends_per_email: pkg.sends_per_email,
        price: pkg.price
      }
    });

  } catch (error) {
    console.error('Error purchasing package:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to purchase package' },
      { status: 500 }
    );
  }
}