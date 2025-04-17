export default function AuthLayout({ children }) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-md">
                {children}
            </div>
        </div>
    );
}
