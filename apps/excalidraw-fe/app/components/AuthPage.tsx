"use client";

export function AuthPage({ isSigningIn }: { isSigningIn: boolean }) {
    return (
        <div className="w-screen h-screen flex items-center justify-center">
            <div className="bg-gray-300 p-8 rounded-2xl shadow-lg w-full max-w-sm">
                <h2 className="text-2xl font-semibold text-center mb-6 text-black">
                    {isSigningIn ? "Sign In" : "Sign Up"}
                </h2>

                <form className="flex flex-col gap-4">
                    <input
                        type="email"
                        placeholder="Email"
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        {isSigningIn ? "Sign In" : "Sign Up"}
                    </button>
                </form>
            </div>
        </div>
    );
}
