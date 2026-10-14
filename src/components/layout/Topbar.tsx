import { useNavigate } from "react-router";
import { useAuthStore } from "@/stores/auth-store";

export function Topbar() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900">
      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
        Admin Dashboard
      </span>

      {user && (
        <div className="flex items-center gap-3">
          <img
            src={user.image}
            alt={user.username}
            className="size-8 rounded-full"
          />
          <span className="text-sm text-slate-700 dark:text-slate-300">
            {user.firstName} {user.lastName}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm text-slate-500 hover:underline dark:text-slate-400"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
}
