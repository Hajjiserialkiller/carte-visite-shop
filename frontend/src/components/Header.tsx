import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ShoppingBag, Menu, X } from "lucide-react";
import Logo from "./Logo";
import LanguageSwitcher from "./LanguageSwitcher";
import CartDrawer from "./CartDrawer";
import { useCart } from "../context/CartContext";

const navItems = [
  { to: "/", key: "home" },
  { to: "/catalog", key: "catalog" },
  { to: "/designer", key: "customizer" },
];

export default function Header() {
  const { t } = useTranslation();
  const { count, items } = useCart();
  const [open, setOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  function openCart() {
    setOpen(false);
    setCartOpen(true);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-ivory/90 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
          {navItems.map((item) => (
<NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${isActive ? "text-gold-dark" : "text-ink/70 hover:text-ink"}`
            }
          >
            {t(`nav.${item.key}`)}
          </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <button
            type="button"
            onClick={openCart}
            className="relative grid h-10 w-10 place-items-center rounded-full border border-ink/15 transition-colors hover:border-ink"
            aria-label={t("nav.cart")}
          >
            <ShoppingBag className="h-4.5 w-4.5 h-[18px] w-[18px]" aria-hidden="true" />
            {count > 0 && (
              <span className="absolute -top-1 -end-1 grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1 text-[10px] font-bold text-ink">
                {count}
              </span>
            )}
          </button>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full border border-ink/15 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-ink/10 bg-ivory md:hidden" aria-label="Mobile">
          <div className="container-page flex flex-col gap-1 py-4">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink/80 hover:bg-ink/5"
              >
                {t(`nav.${item.key}`)}
              </Link>
            ))}
          </div>
        </nav>
      )}

      {items.length > 0 && (
        <div className="border-t border-gold/20 bg-gold/10">
          <div className="container-page py-1.5 text-center text-xs font-medium text-gold-dark">
            {t("nav.freeShipping")}
          </div>
        </div>
      )}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </header>
  );
}
