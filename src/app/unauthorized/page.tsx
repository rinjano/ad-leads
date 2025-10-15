'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, ArrowLeft, Home, LogOut } from 'lucide-react';

export default function UnauthorizedPage() {
  const { user, appUser, signOut } = useAuth();
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-lg shadow-xl border-0">
        <CardHeader className="text-center bg-gradient-to-r from-red-500 to-red-600 text-white rounded-t-lg">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-white/20 rounded-full">
              <AlertTriangle className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Access Denied</CardTitle>
          <CardDescription className="text-red-100">
            You don't have permission to access this resource
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {/* User Information */}
          {user && (
            <div className="bg-gray-50 rounded-lg p-4 border">
              <h3 className="font-semibold text-gray-800 mb-3">Account Information:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium text-gray-800">{user.email}</span>
                </div>
                
                {appUser ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium text-gray-800">{appUser.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Role:</span>
                      <span className="inline-flex px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {appUser.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="inline-flex px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                      No Role Assigned
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error Explanation */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h4 className="font-semibold text-amber-800 mb-2">What happened?</h4>
            <div className="text-sm text-amber-700 space-y-2">
              {!appUser ? (
                <>
                  <p>Your account doesn't have a role assigned in the system.</p>
                  <p>This usually means:</p>
                  <ul className="list-disc ml-4 space-y-1">
                    <li>You're not registered in the user database</li>
                    <li>Your account hasn't been activated by an administrator</li>
                    <li>You're using an email that's not in the system</li>
                  </ul>
                </>
              ) : (
                <>
                  <p>Your current role doesn't have permission to access this page.</p>
                  <p>Contact your system administrator to request additional permissions.</p>
                </>
              )}
            </div>
          </div>

          {/* Demo Accounts Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Testing the System?</h4>
            <p className="text-sm text-blue-700 mb-3">
              If you're testing, try logging in with one of these demo accounts:
            </p>
            <div className="text-xs space-y-1 text-blue-600">
              <div>• <strong>admin@demo.com</strong> - Full system access</div>
              <div>• <strong>representative@demo.com</strong> - CS Representative access</div>
              <div>• <strong>advertiser@demo.com</strong> - Advertiser access</div>
              <div>• <strong>support@demo.com</strong> - Limited CS Support access</div>
              <div>• <strong>retention@demo.com</strong> - Retention specialist access</div>
            </div>
            <p className="text-xs text-blue-600 mt-2">All demo accounts use password: <code className="bg-blue-100 px-1 py-0.5 rounded">demo123</code></p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleGoBack} variant="outline" className="flex-1">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            
            {appUser && (
              <Button onClick={handleGoToDashboard} className="flex-1">
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            )}
            
            <Button onClick={handleSignOut} variant="destructive" className="flex-1">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}