import { getSignInUrl, withAuth } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";

export default async function SignInPage() {
  const { user } = await withAuth();

  if (user) {
    redirect("/admin");
  }

  const signInUrl = await getSignInUrl();

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold mb-4">Sign In</h1>
        <p className="text-gray-600 mb-8">
          Sign in to access the admin dashboard
        </p>
        <a
          href={signInUrl}
          className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Sign in with WorkOS
        </a>
      </div>
    </div>
  );
}
