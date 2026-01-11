import * as React from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu } from "lucide-react";

import { useAuth } from "../auth/AuthContext";
import { ModeToggle } from "./mode-toggle";
import { useTheme } from "./theme-provider";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

function navClass({ isActive }: { isActive: boolean }) {
  return [
    "rounded-lg px-3 py-2 text-sm transition-colors",
    "text-muted-foreground hover:text-foreground hover:bg-primary/10",
    isActive ? "bg-primary text-primary-foreground" : "",
  ].join(" ");
}

function mobileLinkClass({ isActive }: { isActive: boolean }) {
  return [
    "block rounded-lg px-3 py-2 text-sm transition-colors",
    "text-muted-foreground hover:text-foreground hover:bg-primary/10",
    isActive ? "bg-primary text-primary-foreground" : "",
  ].join(" ");
}

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const { theme } = useTheme();

  const [open, setOpen] = React.useState(false);

  const logoSrc = theme === "dark" ? "/lightLogo.svg" : "/darkLogo.svg";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      {/* Taşmayı kesin kesmek için */}
      <div className="mx-auto flex h-14 w-full max-w-5xl min-w-0 items-center px-4 overflow-x-hidden">
        {/* Left: brand */}
        <div className="flex min-w-0 items-center gap-2">
          <img className="h-12 w-12 shrink-0" src={logoSrc} alt="BarberBook" />
          <Link
            to="/"
            className="truncate font-semibold tracking-tight text-foreground hover:opacity-90"
          >
            BarberBook
          </Link>
        </div>

        {/* Right */}
        {!loading && (
          <div className="ml-auto flex min-w-0 items-center gap-2">
            {/* Desktop nav (md+) */}
            <nav className="hidden items-center gap-2 md:flex">
              {!user && (
                <NavLink to="/login" className={navClass}>
                  Login
                </NavLink>
              )}

              {user && (
                <>
                  <NavLink to="/" className={navClass}>
                    Anasayfa
                  </NavLink>
                  <NavLink to="/book" className={navClass}>
                    Randevu Al
                  </NavLink>
                  <NavLink to="/my" className={navClass}>
                    Randevularım
                  </NavLink>

                  {user.role === "BARBER" && (
                    <NavLink to="/barber" className={navClass}>
                      Dashboard
                    </NavLink>
                  )}

                  <ModeToggle />

                  <Button variant="destructive" size="sm" onClick={logout} className="ml-2">
                    Çıkış yap
                  </Button>
                </>
              )}

              {/* user yokken de toggle dursun istersen burada bırakabilirsin */}
              {!user && <ModeToggle />}
            </nav>

            {/* Mobile actions (below md) */}
            <div className="flex items-center gap-2 md:hidden">
              <ModeToggle />

              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" aria-label="Menü">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>

                <SheetContent side="right" className="w-[320px] sm:w-90">
                  <SheetHeader>
                    <SheetTitle>Menü</SheetTitle>
                  </SheetHeader>

                  <div className="mt-4 space-y-2 px-5">
                    {!user ? (
                      <>
                        <NavLink
                          to="/login"
                          className={mobileLinkClass}
                          onClick={() => setOpen(false)}
                        >
                          Giriş Yap / Kayıt Ol
                        </NavLink>

                        <Separator className="my-3" />

                        <NavLink
                          to="/book"
                          className={mobileLinkClass}
                          onClick={() => setOpen(false)}
                        >
                          Randevu Al
                        </NavLink>
                      </>
                    ) : (
                      <>
                        <NavLink
                          to="/"
                          className={mobileLinkClass}
                          onClick={() => setOpen(false)}
                        >
                          Anasayfa
                        </NavLink>
                        <NavLink
                          to="/book"
                          className={mobileLinkClass}
                          onClick={() => setOpen(false)}
                        >
                          Randevu Al
                        </NavLink>
                        <NavLink
                          to="/my"
                          className={mobileLinkClass}
                          onClick={() => setOpen(false)}
                        >
                          Randevularım
                        </NavLink>

                        {user.role === "BARBER" && (
                          <NavLink
                            to="/barber"
                            className={mobileLinkClass}
                            onClick={() => setOpen(false)}
                          >
                            Dashboard
                          </NavLink>
                        )}

                        <Separator className="my-3" />

                        <Button
                          variant="destructive"
                          className="w-full"
                          onClick={() => {
                            setOpen(false);
                            logout();
                          }}
                        >
                          Çıkış yap
                        </Button>
                      </>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
