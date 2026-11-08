export type OrderMode = 'DELIVERY' | 'DINE_IN';

export type BottomNavTab = 'home' | 'menu' | 'rewards' | 'stores';

export type MenuCategoryId =
  | 'all'
  | 'combos'
  | 'peri_peri'
  | 'pizzas'
  | 'garlic_breads'
  | 'desserts'
  | 'drinks'
  | 'deals'
  | 'two_for';

export interface CategoryGridItem {
  id: MenuCategoryId;
  title: string;
  badge?: string;
  subtitle?: string;
  iconType: string;
}

export interface PizzaSizeOption {
  name: 'Regular' | 'Medium' | 'Large';
  price: number;
  serves: string;
}

export interface MenuItem {
  id: string;
  name: string;
  categoryId: MenuCategoryId;
  categoryLabel: string;
  price: number;
  originalPrice?: number;
  description: string;
  isVeg: boolean;
  rating: number;
  ratingCount: number;
  isBestseller?: boolean;
  badge?: string;
  isSideOrder?: boolean;
  hasVariations?: boolean;
  visualType: 'margherita' | 'peppy_paneer' | 'farmhouse' | 'garlic_bread' | 'cold_coffee' | 'choco_lava' | 'garlic_classic' | 'cooler' | 'combo_deal' | 'peri_peri';
  sizes?: PizzaSizeOption[];
}

export interface CartItem {
  id: string; // unique cart line item id
  menuItemId: string;
  name: string;
  basePrice: number;
  price: number;
  quantity: number;
  categoryLabel: string;
  isVeg: boolean;
  selectedSize?: 'Regular' | 'Medium' | 'Large';
  visualType: MenuItem['visualType'];
}

export type CategoryType = 'All' | 'Pizzas' | 'Garlic Breads' | 'Beverages' | 'Desserts';

export interface Coupon {
  code: string;
  discountPercent: number;
  maxDiscount: number;
  minOrder: number;
  description: string;
}

export interface OrderDetails {
  id: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  taxes: number;
  discount: number;
  walletRedeemed: number;
  grandTotal: number;
  appliedCoupon: string | null;
  customerName: string;
  phone: string;
  address: string;
  landmark?: string;
  orderMode: OrderMode;
  outlet: string;
  paymentMethod: 'cod' | 'upi' | 'card';
  orderTime: string;
  estimatedDeliveryTime: string;
  status: 'Received' | 'Baking' | 'Out for Delivery' | 'Delivered';
}

export interface UserProfile {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  walletBalance?: number;
  crownPoints?: number;
  role?: string;
}

export interface CustomizedPizzaOptions {
  size: 'Regular' | 'Medium' | 'Large' | string;
  sizePrice: number;
  crust: 'Classic Hand Tossed' | 'Cheese Burst' | 'Fresh Pan' | string;
  crustPrice: number;
  extraCheese: boolean;
  garlicHerbDip: boolean;
  spicyPeriPeriDip: boolean;
  excludedIngredients: string[];
  beverage: string;
  beveragePrice: number;
  specialInstructions?: string;
}

export interface AttachedSideItem {
  id: string;
  name: string;
  price: number;
}

export interface CartLineItem {
  cartItemId: string;
  pizzaId: string;
  name: string;
  image: string;
  isVeg: boolean;
  basePrice: number;
  totalUnitPrice: number;
  quantity: number;
  selectedSize?: string;
  selectedCrust?: string;
  sizePrice?: number;
  crustPrice?: number;
  attachedSides?: AttachedSideItem[];
  customization: CustomizedPizzaOptions;
}
