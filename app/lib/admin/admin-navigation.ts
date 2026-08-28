import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Layers,
  Boxes,
  Users,
  Tag,
  Palette,
  Settings,
  LucideIcon,
} from "lucide-react"

export interface AdminNavItem {
  title: string
  href: string
  badge?: string | number
  badgeColor?: string
}

export interface AdminNavGroup {
  id: string
  title: string
  icon: LucideIcon
  items: AdminNavItem[]
}

export const ADMIN_NAVIGATION: AdminNavGroup[] = [
  {
    id: "main",
    title: "Main",
    icon: LayoutDashboard,
    items: [
      { title: "Dashboard", href: "/admin" },
    ],
  },
  {
    id: "orders",
    title: "Orders",
    icon: ShoppingCart,
    items: [
      { title: "All Orders", href: "/admin/orders" },
      { title: "Pending", href: "/admin/orders?status=pending", badge: "3", badgeColor: "bg-amber-100 text-amber-700" },
      { title: "Confirmed", href: "/admin/orders?status=confirmed" },
      { title: "Processing", href: "/admin/orders?status=processing" },
      { title: "Shipped", href: "/admin/orders?status=shipped" },
      { title: "Delivered", href: "/admin/orders?status=delivered" },
      { title: "Cancelled", href: "/admin/orders?status=cancelled" },
    ],
  },
  {
    id: "products",
    title: "Products",
    icon: Package,
    items: [
      { title: "All Products", href: "/admin/products" },
      { title: "Add Product", href: "/admin/products/new" },
    ],
  },
  {
    id: "categories",
    title: "Categories",
    icon: Layers,
    items: [
      { title: "All Categories", href: "/admin/categories" },
      { title: "Add Category", href: "/admin/categories/new" },
      { title: "Subcategories", href: "/admin/categories?tab=subcategories" },
    ],
  },
  {
    id: "inventory",
    title: "Inventory",
    icon: Boxes,
    items: [
      { title: "Stock Overview", href: "/admin/inventory" },
      { title: "Low Stock", href: "/admin/inventory/low-stock", badge: "4", badgeColor: "bg-red-100 text-red-700" },
      { title: "Stock History", href: "/admin/inventory/history" },
    ],
  },
  {
    id: "customers",
    title: "Customers",
    icon: Users,
    items: [
      { title: "All Customers", href: "/admin/customers" },
    ],
  },
  {
    id: "marketing",
    title: "Marketing",
    icon: Tag,
    items: [
      { title: "Coupons", href: "/admin/coupons" },
      { title: "Reviews", href: "/admin/reviews", badge: "2", badgeColor: "bg-blue-100 text-blue-700" },
    ],
  },
  {
    id: "storefront",
    title: "Storefront",
    icon: Palette,
    items: [
      { title: "Homepage", href: "/admin/storefront" },
      { title: "Hero Slides", href: "/admin/storefront/hero-slides" },
      { title: "Featured Products", href: "/admin/storefront/featured-products" },
      { title: "Promotional Tiles", href: "/admin/storefront/promo-tiles" },
      { title: "Featured Categories", href: "/admin/storefront/featured-categories" },
    ],
  },
  {
    id: "settings",
    title: "Settings",
    icon: Settings,
    items: [
      { title: "Store Settings", href: "/admin/settings/store" },
      { title: "Delivery", href: "/admin/settings/delivery" },
      { title: "Order Settings", href: "/admin/settings/orders" },
      { title: "Social Links", href: "/admin/settings/social" },
    ],
  },
]
