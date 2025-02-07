import Link from "next/link";

export default function NotLoggedWindow() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bottom-44">
      <div className="w-96 p-6 border border-darkBeige shadow-lg rounded-lg flex flex-col text-left items-center gap-4">
        <p className="text-lg text-center">
          Welcome to <span className="font-bold">Artisan Track</span>!  
          Manage your products, orders, materials and finance.  
        </p>
        <p className="text-center text-gray-600">
          Sign in to continue or create a new account to get started.
        </p>

        <div className="flex flex-col gap-3 mt-4 w-full">
          <Link href="/pages/login">
            <button className="font-bold bg-green py-2 px-4 rounded-lg w-full">
              Log In
            </button>
          </Link>
          <Link href="/pages/signin">
            <button className="font-bold border-2 border-green py-2 px-4 rounded-lg w-full">
              Create Account
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
