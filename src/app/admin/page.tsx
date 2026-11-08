'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchLiveStoreData, insertCategoryDirect, insertProductWithSizesDirect, deleteMenuItemDirect, deleteCategoryDirect, fetchLiveOrdersDirect, createOrderDirectly } from '../../lib/neonClient';
import { restaurantBuzzer } from '../../lib/buzzer';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'CATEGORIES' | 'PRODUCTS' | 'BANNERS' | 'BEVERAGES' | 'COUPONS_AFFILIATE' | 'MENU_MODIFIER' | 'LIVE_ORDERS' | 'BRANCHES'>('CATEGORIES');
  
  // Active Order Radar with Persistent Buzzer
  const [newOrdersCount, setNewOrdersCount] = useState(0);

  // Live Neon PostgreSQL Data States (100% Persisted DB)
  const [categories, setCategories] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [beverages, setBeverages] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [staffMembers, setStaffMembers] = useState<any[]>([]);
  const [allStaff, setAllStaff] = useState<any[]>([]);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  // Sides & Beverages (MealAddon) States
  const [addonList, setAddonList] = useState<any[]>([]);
  const [newAddonType, setNewAddonType] = useState<'SIDE' | 'BEVERAGE'>('SIDE');
  const [newAddonName, setNewAddonName] = useState('');
  const [newAddonPrice, setNewAddonPrice] = useState('');
  const [newAddonImg, setNewAddonImg] = useState('');

  // Branch & Staff Forms
  const [branchName, setBranchName] = useState('');
  const [branchCity, setBranchCity] = useState('');
  const [branchAddress, setBranchAddress] = useState('');
  const [branchPhone, setBranchPhone] = useState('9305938873');
  const [bLat, setBLat] = useState('');
  const [bLng, setBLng] = useState('');
  const [bRadius, setBRadius] = useState('10');
  const [creatingBranch, setCreatingBranch] = useState(false);

  // Billing Charges Form State
  const [gst, setGst] = useState('5');
  const [deliveryFee, setDeliveryFee] = useState('30');
  const [freeAbove, setFreeAbove] = useState('499');
  const [platformFee, setPlatformFee] = useState('5');
  const [packagingFee, setPackagingFee] = useState('15');
  const [welcomeCashback, setWelcomeCashback] = useState('50');
  const [orderCashback, setOrderCashback] = useState('5');
  const [minOrderCashback, setMinOrderCashback] = useState('199');
  const [savingSettings, setSavingSettings] = useState(false);

  const fetchCurrentAdminGps = () => {
    if (!navigator.geolocation) return alert('GPS unsupported on this device/browser');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setBLat(pos.coords.latitude.toFixed(6));
        setBLng(pos.coords.longitude.toFixed(6));
        alert('📍 Current Store Coordinates Fetched!');
      },
      (err) => alert('GPS Error: ' + err.message),
      { enableHighAccuracy: true }
    );
  };

  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('password123');
  const [staffRole, setStaffRole] = useState<'STORE_MANAGER' | 'RIDER'>('STORE_MANAGER');
  const [staffBranchId, setStaffBranchId] = useState('');
  const [staffPhone, setStaffPhone] = useState('9305938873');
  const [creatingStaff, setCreatingStaff] = useState(false);

  // Category & Product Branch Mapping
  const [catBranchIds, setCatBranchIds] = useState<string[]>(['ALL']);
  const [prodBranchIds, setProdBranchIds] = useState<string[]>(['ALL']);
  const [availableBranches, setAvailableBranches] = useState<any[]>([]);
  const [selectedBranchesForItem, setSelectedBranchesForItem] = useState<string[]>(['ALL']);

  const toggleBranchSelection = (branchId: string) => {
    if (branchId === 'ALL') {
      setSelectedBranchesForItem(['ALL']);
      return;
    }
    let updated = selectedBranchesForItem.filter(id => id !== 'ALL');
    if (updated.includes(branchId)) {
      updated = updated.filter(id => id !== branchId);
    } else {
      updated.push(branchId);
    }
    if (updated.length === 0) updated = ['ALL'];
    setSelectedBranchesForItem(updated);
  };

  // Category Form
  const [catName, setCatName] = useState('');
  const [catOrder, setCatOrder] = useState('1');
  const [catIcon, setCatIcon] = useState<string | null>(null);

  // Product Form & Multi-size Pizza States & Live Categories for Dropdown
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [hasVariants, setHasVariants] = useState<boolean>(true);
  const [priceRegular, setPriceRegular] = useState<string>('');
  const [priceMedium, setPriceMedium] = useState<string>('');
  const [priceLarge, setPriceLarge] = useState<string>('');
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState('');
  const [prodBasePrice, setProdBasePrice] = useState('');
  const [prodMrp, setProdMrp] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodImage, setProdImage] = useState<string | null>(null);
  const [prodIsVeg, setProdIsVeg] = useState(true);
  const [hasVariations, setHasVariations] = useState(false);
  const [isDessert, setIsDessert] = useState(false);

  // Banner Form
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [bannerImageBase64, setBannerImageBase64] = useState('');
  const [adminBanners, setAdminBanners] = useState<any[]>([]);

  // Beverage Form
  const [bevName, setBevName] = useState('');
  const [bevPrice, setBevPrice] = useState('');
  const [bevImage, setBevImage] = useState<string | null>(null);

  // Coupon Form
  const [coupCode, setCoupCode] = useState('');
  const [coupType, setCoupType] = useState('PERCENT');
  const [coupVal, setCoupVal] = useState('');
  const [coupMin, setCoupMin] = useState('');
  const [scopeType, setScopeType] = useState<'ALL' | 'CATEGORY' | 'ITEM' | 'COMBO'>('ALL');
  const [selectedScopeIds, setSelectedScopeIds] = useState<string[]>([]);

  const toggleScopeId = (id: string) => {
    if (selectedScopeIds.includes(id)) {
      setSelectedScopeIds(selectedScopeIds.filter(x => x !== id));
    } else {
      setSelectedScopeIds([...selectedScopeIds, id]);
    }
  };

  // Affiliate Form
  const [affName, setAffName] = useState('');
  const [affCode, setAffCode] = useState('');
  const [affEmail, setAffEmail] = useState('');
  const [affPass, setAffPass] = useState('');
  const [affDiscount, setAffDiscount] = useState('10');
  const [affComm, setAffComm] = useState('10');
  const [affScopeType, setAffScopeType] = useState<'ALL' | 'CATEGORY' | 'ITEM' | 'COMBO'>('ALL');
  const [affSelectedScopeIds, setAffSelectedScopeIds] = useState<string[]>([]);

  const toggleAffScopeId = (id: string) => {
    if (affSelectedScopeIds.includes(id)) {
      setAffSelectedScopeIds(affSelectedScopeIds.filter(x => x !== id));
    } else {
      setAffSelectedScopeIds([...affSelectedScopeIds, id]);
    }
  };

  // Profile Drilldown Modal State
  const [selectedPartnerProfile, setSelectedPartnerProfile] = useState<any | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [drilldownData, setDrilldownData] = useState<any | null>(null);

  // Quick add coupon directly to selected partner
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState('10');
  const [newCouponComm, setNewCouponComm] = useState('10');
  const [newCouponScopeType, setNewCouponScopeType] = useState<'ALL' | 'CATEGORY' | 'ITEM' | 'COMBO'>('ALL');
  const [addingCoupon, setAddingCoupon] = useState(false);

  const openPartnerDrilldown = async (partner: any) => {
    setSelectedPartnerProfile(partner);
    setLoadingProfile(true);
    setDrilldownData(null);
    try {
      const res = await fetch(`/api/affiliate?profileId=${partner.id}`);
      const data = await res.json();
      if (data.success) {
        setDrilldownData(data);
      } else {
        alert('Could not load profile: ' + (data.message || data.error));
      }
    } catch {
      alert('Network error loading profile');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleDeletePartnerCoupon = async (couponId: string) => {
    if (!confirm('Kya aap is coupon ko delete karna chahte hain?')) return;
    await fetch('/api/affiliate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'DELETE_COUPON', couponId })
    });
    if (selectedPartnerProfile) {
      openPartnerDrilldown(selectedPartnerProfile);
    }
    loadAllData();
  };

  const handleAddCouponToPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode) return alert('Coupon code bharein');
    setAddingCoupon(true);
    try {
      const res = await fetch('/api/affiliate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE_AFFILIATE',
          name: selectedPartnerProfile.name,
          email: selectedPartnerProfile.email,
          password: selectedPartnerProfile.password || '123456',
          couponCode: newCouponCode,
          commissionPercent: Number(newCouponComm || selectedPartnerProfile.commissionPercent || 10),
          discountPercent: Number(newCouponDiscount || 10),
          applicableType: newCouponScopeType,
          applicableIds: []
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || 'Coupon add ho gaya!');
        setNewCouponCode('');
        openPartnerDrilldown(selectedPartnerProfile);
        loadAllData();
      } else {
        alert(data.error || 'Failed to add coupon');
      }
    } catch {
      alert('Network error');
    } finally {
      setAddingCoupon(false);
    }
  };

  // Canvas Image Compressor
  const compress = (file: File, size = 600): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let w = img.width, h = img.height;
          if (w > h && w > size) { h = Math.round((h * size) / w); w = size; }
          else if (h > size) { w = Math.round((w * size) / h); h = size; }
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d')?.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
      };
      reader.readAsDataURL(file);
    });
  };

  // A. Load data using Direct Neon with robust fallbacks:
  const loadAllData = async () => {
    try {
      const res = await fetchLiveStoreData();
      if (res.success && res.data) {
        setBranches(res.data.branches || []);
        setAvailableBranches(res.data.branches || []);
        if (Array.isArray(res.data.categories)) {
          setCategories(res.data.categories);
          setCategoriesList(res.data.categories);
          if (res.data.categories.length > 0 && !selectedCategory) {
            setSelectedCategory(res.data.categories[0].name);
          }
        }
        setMenuItems(res.data.menuItems || []);
        setCoupons(res.data.coupons || []);
        if (Array.isArray((res.data as any).orders)) setOrders((res.data as any).orders);
        if (Array.isArray((res.data as any).affiliates)) setAffiliates((res.data as any).affiliates);
        if (Array.isArray((res.data as any).staff)) setStaffMembers((res.data as any).staff);
        if (Array.isArray((res.data as any).banners)) setBanners((res.data as any).banners);
        if (res.data.settings) {
          setGst(String(res.data.settings.gstPercent ?? 5));
          setDeliveryFee(String(res.data.settings.deliveryFee ?? 30));
          setFreeAbove(String(res.data.settings.freeDeliveryAbove ?? 499));
          setPlatformFee(String(res.data.settings.platformFee ?? 5));
          setPackagingFee(String(res.data.settings.packagingFee ?? 15));
          setWelcomeCashback(String(res.data.settings.welcomeCashbackAmount ?? 50));
          setOrderCashback(String(res.data.settings.orderCashbackPercent ?? 5));
          setMinOrderCashback(String(res.data.settings.minOrderForCashback ?? 199));
        }
      }
    } catch (e: any) {
      console.warn('Direct load notice:', e?.message || e);
    }
  };

  // Fetch Categories for Dropdown
  const fetchCategories = async () => {
    try {
      const res = await fetchLiveStoreData();
      if (res.success && res.data?.categories) {
        setCategoriesList(res.data.categories);
        if (res.data.categories.length > 0 && !selectedCategory) {
          setSelectedCategory(res.data.categories[0].name);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadAddonsInAdmin = async () => {
    try {
      const res = await fetch('/api?action=GET_MEAL_ADDONS&ts=' + Date.now());
      const data = await res.json().catch(() => ({}));
      if (data.success && Array.isArray(data.addons)) {
        setAddonList(data.addons);
      }
    } catch (e) {
      console.warn('Failed to load addons:', e);
    }
  };

  const handleAddAddon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddonName.trim()) return alert('Name dalein!');
    try {
      const res = await fetch('/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE_MEAL_ADDON',
          type: newAddonType,
          name: newAddonName.trim(),
          price: Number(newAddonPrice) || 0,
          image: newAddonImg || 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=200'
        })
      });
      const data = await res.json().catch(() => ({}));
      if (data.success) {
        setNewAddonName(''); setNewAddonPrice(''); setNewAddonImg('');
        loadAddonsInAdmin();
        alert('Side / Beverage add ho gaya!');
      } else {
        alert('Error: ' + (data.error || 'Failed to add item'));
      }
    } catch (err: any) {
      alert('Network Error: ' + err.message);
    }
  };

  const handleDeleteAddon = async (id: string, name: string) => {
    if (!confirm(`Kya aap "${name}" ko database se delete karna chahte hain?`)) return;
    try {
      await fetch(`/api?type=MEAL_ADDON&id=${id}`, { method: 'DELETE' });
      loadAddonsInAdmin();
      alert('Item database se delete ho gaya!');
    } catch (err: any) {
      alert('Delete error: ' + err.message);
    }
  };

  useEffect(() => {
    fetchCategories();
    loadAddonsInAdmin();
  }, []);

  useEffect(() => {
    let isMounted = true;
    const syncFromDB = async () => {
      if (isMounted) {
        await loadAllData();
        await loadAddonsInAdmin();
      }
    };

    syncFromDB();
    const interval = setInterval(syncFromDB, 7000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Active Order Radar with Persistent Buzzer via Direct Neon Poller
  const refreshOrders = async () => {
    try {
      setOrdersError(null);
      const liveOrders = await fetchLiveOrdersDirect();
      setOrdersList(liveOrders);
      setOrders(liveOrders);
      const unaccepted = liveOrders.filter((o: any) => o.status === 'PLACED');
      setNewOrdersCount(unaccepted.length);
      if (unaccepted.length > 0) {
        restaurantBuzzer.startAlert();
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate([500, 250, 500]);
        }
      } else {
        restaurantBuzzer.stopAlert();
      }
    } catch (e: any) {
      console.error('Error fetching admin orders:', e);
      setOrdersError(e?.message || 'Database connection error fetching orders');
    }
  };

  const handleTestOrderAndAlarm = async () => {
    try {
      const testOrder = await createOrderDirectly({
        customerName: 'Test Customer',
        customerPhone: '9999999999',
        deliveryAddress: 'Test Address',
        items: [{ name: 'Test Pizza', price: 199, quantity: 1 }],
        totalAmount: 199,
        branchId: 'br_mahmudabad',
        branchName: 'Mahmudabad Main Branch'
      });
      alert(`🎉 Test Order #${testOrder.orderNumber || testOrder.id} successfully created!`);
      await refreshOrders();
      restaurantBuzzer.startAlert();
    } catch (err: any) {
      console.error('Test order error:', err);
      alert('Order Error: ' + err.message);
    }
  };

  useEffect(() => {
    refreshOrders();
    const timer = setInterval(refreshOrders, 3000);
    return () => {
      clearInterval(timer);
      restaurantBuzzer.stopAlert();
    };
  }, []);

  // B. Save Category Direct:
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return alert('Category Name bharein!');
    try {
      await insertCategoryDirect(catName, catIcon || '');
      // Background sync to API as well
      fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'CATEGORY', 
          name: catName.trim(), 
          image: catIcon || '',
          iconUrl: catIcon || '',
          branchIds: catBranchIds
        })
      }).catch(() => {});

      alert('🎉 Category Neon DB me directly save ho gayi!');
      setCatName('');
      setCatIcon(null);
      setCatBranchIds(['ALL']);
      loadAllData();
    } catch (err: any) {
      alert('Save failed: ' + err.message);
    }
  };

  const handleDeleteCategory = async (catId: string, catName: string) => {
    if (!confirm(`Kya aap category "${catName}" ko permanently delete karna chahte hain?`)) return;

    try {
      // 1. Direct Neon Delete
      await deleteCategoryDirect(catId);

      // 2. Fallback to API delete endpoint
      await fetch(`/api?action=DELETE&type=CATEGORY&id=${catId}`, {
        method: 'DELETE'
      }).catch(() => {});

      alert('✅ Category permanently delete ho gayi!');
      loadAllData(); // Refresh UI
    } catch (err: any) {
      alert('Delete error: ' + err.message);
    }
  };

  // C. Save Product Direct with Size Variants:
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const catToUse = selectedCategory || prodCategory;
    const nameToUse = prodName.trim();
    if (!nameToUse || !catToUse || !priceRegular) {
      return alert('Name, Category aur Regular Price zaroori hain!');
    }

    try {
      const payload = {
        name: nameToUse,
        categoryName: catToUse,
        description: prodDesc.trim(),
        image: prodImage || 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=500',
        price: Number(priceRegular),
        hasVariants: hasVariants,
        sizePrices: {
          regular: Number(priceRegular) || 0,
          medium: Number(priceMedium) || Math.round(Number(priceRegular) * 1.8),
          large: Number(priceLarge) || Math.round(Number(priceRegular) * 2.5)
        },
        branchIds: selectedBranchesForItem
      };

      await insertProductWithSizesDirect(payload);

      // Background sync to API
      fetch('/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CREATE_MENU_ITEM', ...payload })
      }).catch(() => {});

      alert('🎉 Product aur Sizes direct Neon DB me save ho gaye!');
      setProdName('');
      setPriceRegular('');
      setPriceMedium('');
      setPriceLarge('');
      setProdBasePrice('');
      setProdDesc('');
      setProdImage(null);
      setSelectedBranchesForItem(['ALL']);
      loadAllData();
    } catch (err: any) {
      alert('Product save error: ' + err.message);
    }
  };

  // Dynamic Billing Settings Action
  const handleSaveBillingSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gstPercent: Number(gst),
          deliveryFee: Number(deliveryFee),
          freeDeliveryAbove: Number(freeAbove),
          platformFee: Number(platformFee),
          packagingFee: Number(packagingFee),
          welcomeCashbackAmount: Number(welcomeCashback),
          orderCashbackPercent: Number(orderCashback),
          minOrderForCashback: Number(minOrderCashback)
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('Dynamic Billing & Loyalty Cashback settings saved successfully!');
      } else {
        alert('Error saving settings: ' + (data.error || 'Failed'));
      }
    } catch {
      alert('Network error saving billing settings');
    } finally {
      setSavingSettings(false);
    }
  };

  // Branch & Staff Actions
  const handleCreateBranch = async (e?: React.FormEvent) => {
    if (e?.preventDefault) e.preventDefault();
    if (!branchName.trim() || !branchCity.trim() || !branchAddress.trim()) {
      return alert('Name, City aur Address zaroori hai');
    }
    setCreatingBranch(true);
    try {
      const payload = {
        action: 'CREATE_BRANCH',
        name: branchName.trim(),
        city: branchCity.trim(),
        address: branchAddress.trim(),
        phone: (branchPhone || '9305938873').trim(),
        latitude: Number(bLat) || 27.2894,
        longitude: Number(bLng) || 81.1278,
        deliveryRadiusKm: Number(bRadius) || 10
      };

      let res = await fetch('/api/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.status === 404) {
        res = await fetch('/api/index', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Server returned non-JSON response (${res.status}): ${text.slice(0, 100)}`);
      }

      if (data.success) {
        alert(data.message || 'Branch successfully ban gayi!');
        setBranchName(''); setBranchCity(''); setBranchAddress(''); setBLat(''); setBLng(''); setBRadius('10');
        loadAllData();
      } else {
        alert(data.error || data.message || 'Failed to create branch');
      }
    } catch (err: any) {
      console.error('Branch creation error:', err);
      alert(err.message || 'Network error creating branch');
    } finally {
      setCreatingBranch(false);
    }
  };
  const handleSaveBranch = handleCreateBranch;

  const handleDeleteBranch = async (branchId: string) => {
    if (!confirm('Kya aap is branch aur iske attached staff ko delete karna chahte hain?')) return;
    try {
      await fetch('/api/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DELETE_BRANCH', branchId })
      });
      loadAllData();
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
  };

  const loadStaffDirectory = async () => {
    try {
      const res = await fetch('/api?action=GET_STAFF&ts=' + Date.now());
      const json = await res.json().catch(() => null);
      if (json && json.success && Array.isArray(json.staff)) {
        setAllStaff(json.staff);
        setStaffMembers(json.staff);
      }
    } catch (e) {
      console.error('Failed to load staff list', e);
    }
  };

  useEffect(() => {
    loadStaffDirectory();
  }, []);

  const togglePass = (id: string) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName || !staffEmail || !staffPassword || !staffBranchId) {
      return alert('Sabhi fields bharein');
    }
    setCreatingStaff(true);
    try {
      const payload = {
        action: 'CREATE_STAFF',
        name: staffName,
        email: staffEmail,
        password: staffPassword,
        role: staffRole,
        branchId: staffBranchId,
        phone: staffPhone
      };

      const res = await fetch('/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => null);
      if (data && data.success) {
        alert(data.message || 'Staff member successfully add ho gaya!');
        setStaffName(''); setStaffEmail(''); setStaffPassword('password123');
        loadStaffDirectory();
        loadAllData();
      } else {
        alert(data?.error || data?.message || 'Failed to add staff');
      }
    } catch {
      alert('Network error adding staff');
    } finally {
      setCreatingStaff(false);
    }
  };

  const handleDeleteStaff = async (id: string, name?: string) => {
    if (!confirm(`Kya aap staff "${name || 'member'}" ko delete karna chahte hain?`)) return;
    try {
      await fetch(`/api?action=DELETE&type=STAFF&id=${id}`, { method: 'DELETE' }).catch(() => {});
      await fetch('/api/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DELETE_STAFF', staffId: id })
      }).catch(() => {});
      loadStaffDirectory();
      loadAllData();
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
  };

  // Banner Actions
  const loadBanners = async () => {
    try {
      const res = await fetch('/api?action=GET_BANNERS');
      const data = await res.json().catch(() => ({}));
      if (data.success) {
        setAdminBanners(data.banners || []);
        setBanners(data.banners || []);
      }
    } catch {}
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setBannerImageBase64(result);
      setBannerImage(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    const imageToSave = bannerImageBase64 || bannerImage;
    if (!bannerTitle || !imageToSave) return alert('Title aur Banner image zaroori hai!');

    try {
      const res = await fetch('/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SAVE_BANNER',
          title: bannerTitle,
          image: imageToSave
        })
      });
      const data = await res.json().catch(() => ({}));
      if (data.success) {
        alert('🎉 Banner successfully save ho gaya!');
        setBannerTitle('');
        setBannerImageBase64('');
        setBannerImage(null);
        loadBanners();
        loadAllData();
      } else {
        alert('Error: ' + (data.error || 'Failed to save banner'));
      }
    } catch (err: any) {
      alert('Network error: ' + err.message);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Kya aap is banner ko delete karna chahte hain?')) return;
    try {
      await fetch(`/api?action=DELETE&type=PROMO_BANNER&id=${id}`, { method: 'DELETE' });
      loadBanners();
      loadAllData();
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    }
  };

  // Beverage Actions
  const handleSaveBeverage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bevName || !bevPrice || !bevImage) return alert('Name, Price aur Image bharein');
    await fetch('/api/beverages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: bevName, price: Number(bevPrice), imageUrl: bevImage })
    });
    setBevName(''); setBevPrice(''); setBevImage(null);
    alert('Beverage pairing add ho gayi!');
    loadAllData();
  };

  const parseResponse = async (res: Response) => {
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      throw new Error(`Server returned HTML (${res.status}): ${text.slice(0, 100)}`);
    }
  };

  // Coupon submit handler
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let res = await fetch('/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE_COUPON',
          code: coupCode,
          discountType: coupType,
          discountValue: coupVal,
          minOrderAmount: coupMin || 0,
          applicableType: scopeType,
          applicableIds: selectedScopeIds
        })
      }).catch(() => null);

      if (!res || !res.ok) {
        res = await fetch('/api/affiliate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'CREATE_COUPON',
            code: coupCode,
            discountType: coupType,
            discountValue: coupVal,
            minOrderAmount: coupMin || 0,
            applicableType: scopeType,
            applicableIds: selectedScopeIds
          })
        });
      }

      const data = await parseResponse(res);
      if (data.success) {
        alert(data.message || '🎉 Promo Code Save Ho Gaya!');
        setCoupCode(''); setCoupVal(''); setCoupMin(''); setSelectedScopeIds([]);
        loadAllData();
      } else {
        alert('Error: ' + (data.error || data.message));
      }
    } catch (err: any) {
      alert('Network Error: ' + err.message);
    }
  };

  // Affiliate submit handler
  const handleCreateAffiliate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let res = await fetch('/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE_AFFILIATE',
          name: affName,
          email: affEmail,
          password: affPass,
          couponCode: affCode,
          discountPercent: affDiscount || 10,
          commissionPercent: affComm || 10,
          applicableType: affScopeType || scopeType,
          applicableIds: affSelectedScopeIds.length > 0 ? affSelectedScopeIds : selectedScopeIds
        })
      }).catch(() => null);

      if (!res || !res.ok) {
        res = await fetch('/api/affiliate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'CREATE_AFFILIATE',
            name: affName,
            email: affEmail,
            password: affPass,
            couponCode: affCode,
            discountPercent: affDiscount || 10,
            commissionPercent: affComm || 10,
            applicableType: affScopeType || scopeType,
            applicableIds: affSelectedScopeIds.length > 0 ? affSelectedScopeIds : selectedScopeIds
          })
        });
      }

      const data = await parseResponse(res);
      if (data.success) {
        alert(data.message || '🎉 Affiliate Account Create Ho Gaya!');
        setAffName(''); setAffEmail(''); setAffPass(''); setAffCode(''); setSelectedScopeIds([]); setAffSelectedScopeIds([]);
        loadAllData();
      } else {
        alert('Error: ' + (data.error || data.message));
      }
    } catch (err: any) {
      alert('Network Error: ' + err.message);
    }
  };

  const handleDeleteMenuItem = async (itemId: string) => {
    if (!confirm('Kya aap sach me is item ko database se delete karna chahte hain?')) return;
    try {
      await deleteMenuItemDirect(itemId).catch(() => {});
      fetch(`/api?action=DELETE&type=ITEM&id=${itemId}`, { method: 'DELETE' }).catch(() => {});
      alert('✅ Item database se delete ho gaya!');
      loadAllData();
    } catch (err: any) {
      alert('Error deleting: ' + err.message);
    }
  };

  const handleDelete = async (url: string) => {
    if (!confirm('Kya aap ise delete karna chahte hain?')) return;
    await fetch(url, { method: 'DELETE' });
    loadAllData();
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white p-4 sm:p-6 font-sans">
      {/* Floating Alert Banner in UI when new order arrives */}
      {newOrdersCount > 0 && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] bg-red-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-4 animate-bounce border-2 border-amber-300">
          <span className="text-2xl animate-spin">🔔</span>
          <div>
            <h4 className="text-xs font-black">Naya Order Aaya Hai! ({newOrdersCount} Pending)</h4>
            <p className="text-[10px] text-amber-200">Kripya order accept karke KDS ko forward karein.</p>
          </div>
          <button
            onClick={() => {
              restaurantBuzzer.stopAlert();
              window.location.reload();
            }}
            className="bg-white text-red-600 px-3 py-1 rounded-xl text-xs font-black cursor-pointer shadow-md"
          >
            MUTE ALARM
          </button>
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* TOP BRAND HEADER */}
        <div className="flex flex-wrap items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h1 className="text-2xl font-black text-orange-500 flex items-center gap-2">
              🍕 HACKY PIZZA ERP v2.1
            </h1>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">
              Super Admin Master Control • Mahmudabad
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={async () => {
                try {
                  const testOrder = await createOrderDirectly({
                    customerName: 'Test Customer',
                    customerPhone: '9999999999',
                    deliveryAddress: 'Test Address',
                    items: [{ name: 'Test Pizza', price: 199, quantity: 1 }],
                    totalAmount: 199,
                    branchId: 'br_mahmudabad',
                    branchName: 'Mahmudabad Main Branch'
                  });
                  alert('✅ Test Order Saved: ' + testOrder.orderNumber);
                  restaurantBuzzer.startAlert();
                  window.location.reload();
                } catch (err: any) {
                  alert('❌ DB Error: ' + err.message);
                }
              }}
              className="bg-orange-600 text-white px-3 py-1.5 rounded-xl text-xs font-black"
            >
              🧪 Test Order + Alarm
            </button>
            <button onClick={loadAllData} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold cursor-pointer">
              🔄 Sync DB
            </button>
          </div>
        </div>

        {/* RESTORED QUICK SYSTEM LINKS */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <Link href="/manager" className="p-3 bg-[#1E1E1E] hover:bg-orange-600/20 border border-white/10 rounded-2xl flex items-center gap-2 transition-all">
            <span className="text-lg">🏪</span>
            <div className="min-w-0">
              <p className="text-xs font-black truncate">Store Manager</p>
              <p className="text-[10px] text-gray-400">Order Alerts</p>
            </div>
          </Link>
          <Link href="/kds" className="p-3 bg-[#1E1E1E] hover:bg-orange-600/20 border border-white/10 rounded-2xl flex items-center gap-2 transition-all">
            <span className="text-lg">🍳</span>
            <div className="min-w-0">
              <p className="text-xs font-black truncate">Kitchen KDS</p>
              <p className="text-[10px] text-gray-400">Live Cook</p>
            </div>
          </Link>
          <Link href="/rider" className="p-3 bg-[#1E1E1E] hover:bg-orange-600/20 border border-white/10 rounded-2xl flex items-center gap-2 transition-all">
            <span className="text-lg">🛵</span>
            <div className="min-w-0">
              <p className="text-xs font-black truncate">Rider Panel</p>
              <p className="text-[10px] text-gray-400">Deliveries</p>
            </div>
          </Link>
          <Link href="/influencer" className="p-3 bg-[#1E1E1E] hover:bg-purple-600/20 border border-white/10 rounded-2xl flex items-center gap-2 transition-all">
            <span className="text-lg">💸</span>
            <div className="min-w-0">
              <p className="text-xs font-black truncate">Influencer</p>
              <p className="text-[10px] text-gray-400">Affiliates ({affiliates.length})</p>
            </div>
          </Link>
          <Link href="/" target="_blank" className="p-3 bg-[#1E1E1E] hover:bg-green-600/20 border border-white/10 rounded-2xl flex items-center gap-2 transition-all col-span-2 sm:col-span-1">
            <span className="text-lg">🌐</span>
            <div className="min-w-0">
              <p className="text-xs font-black truncate">Storefront</p>
              <p className="text-[10px] text-gray-400">Live Website</p>
            </div>
          </Link>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex gap-2 overflow-x-auto pb-2 border-b border-white/10">
          {[
            { id: 'CATEGORIES', label: '📁 Categories' },
            { id: 'PRODUCTS', label: '🍕 Add Product' },
            { id: 'BRANCHES', label: `🏢 Branches & Staff (${branches.length})` },
            { id: 'BANNERS', label: '🖼️ Slider Banners' },
            { id: 'BEVERAGES', label: `🍟 Sides & Drinks (${addonList.length})` },
            { id: 'COUPONS_AFFILIATE', label: `🎟️ Coupons & Affiliates (${coupons.length + affiliates.length})` },
            { id: 'MENU_MODIFIER', label: '✏️ Menu Modifier' },
            { id: 'LIVE_ORDERS', label: `📦 Orders (${ordersList.length || orders.length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                activeTab === tab.id ? 'bg-orange-600 text-white shadow-lg' : 'bg-[#1E1E1E] text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: CATEGORIES */}
        {activeTab === 'CATEGORIES' && (
          <div className="bg-[#1C1C1C] p-5 rounded-2xl border border-white/10 space-y-4">
            <h2 className="text-base font-black text-orange-400">+ Add New Category</h2>
            <form onSubmit={handleSaveCategory} className="space-y-3">
              <input
                type="text"
                placeholder="Category Name (e.g. Value Meals, Hand Tossed Pizzas)"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                className="w-full bg-[#2A2A2A] border border-white/10 rounded-xl p-2.5 text-xs text-white"
                required
              />

              {/* Branch Availability Selector */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-bold text-gray-400 block">Available in Branches:</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setCatBranchIds(['ALL'])}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                      catBranchIds.includes('ALL') ? 'bg-orange-600 border-orange-500 text-white' : 'bg-[#2A2A2A] border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    🌐 All Branches (Global)
                  </button>
                  {branches.map(b => {
                    const isSelected = !catBranchIds.includes('ALL') && catBranchIds.includes(b.id);
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          let next = catBranchIds.filter(x => x !== 'ALL');
                          if (next.includes(b.id)) {
                            next = next.filter(x => x !== b.id);
                            if (next.length === 0) next = ['ALL'];
                          } else {
                            next.push(b.id);
                          }
                          setCatBranchIds(next);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                          isSelected ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-[#2A2A2A] border-white/10 text-gray-400 hover:text-white'
                        }`}
                      >
                        🏢 {b.name} {isSelected && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>

              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (f) setCatIcon(await compress(f, 300));
                }}
                className="w-full text-xs text-gray-400 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:bg-orange-600 file:text-white"
              />
              {catIcon && <img src={catIcon} alt="" className="w-12 h-12 rounded-xl object-cover border border-orange-500" />}
              <button type="submit" className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 rounded-xl text-xs font-black">
                💾 SAVE CATEGORY
              </button>
            </form>

            <div className="pt-4 border-t border-white/10">
              <p className="text-xs font-black text-gray-400 mb-2">Existing Categories ({categories.length})</p>
              <div className="space-y-2">
                {categories.map((cat: any) => (
                  <div key={cat.id} className="p-3 bg-[#242424] rounded-2xl border border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img 
                        src={cat.image || cat.iconUrl || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=100'} 
                        alt={cat.name} 
                        className="w-10 h-10 rounded-xl object-cover" 
                      />
                      <span className="text-xs font-black text-white">{cat.name}</span>
                    </div>

                    <button
                      onClick={() => handleDeleteCategory(cat.id, cat.name)}
                      className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 rounded-xl text-xs font-black transition-all cursor-pointer"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS */}
        {activeTab === 'PRODUCTS' && (
          <div className="bg-[#1C1C1C] p-5 rounded-2xl border border-white/10 space-y-4">
            <h2 className="text-base font-black text-orange-400">+ Add New Product / Pizza</h2>
            <form onSubmit={handleSaveProduct} className="space-y-3">
              {/* Category Selector Dropdown JSX */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-300">Select Category *</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setProdCategory(e.target.value);
                  }}
                  className="w-full bg-[#2A2A2A] border border-white/10 rounded-xl p-3 text-xs text-white font-bold"
                  required
                >
                  <option value="" disabled>-- Chunein Category --</option>
                  {(categoriesList.length > 0 ? categoriesList : categories).map((cat: any) => (
                    <option key={cat.id || cat.name} value={cat.name} className="bg-[#1C1C1C]">
                      📂 {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-300 block mb-1">Product Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Farmhouse Special Paneer Pizza"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  className="w-full bg-[#2A2A2A] border border-white/10 rounded-xl p-3 text-xs text-white font-bold"
                  required
                />
              </div>

              {/* Multi-Size Variants Price Inputs JSX */}
              <div className="bg-[#242424] p-3.5 rounded-2xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-400">🍕 Pizza Sizes & Pricing</span>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300 font-bold">
                    <input
                      type="checkbox"
                      checked={hasVariants}
                      onChange={(e) => setHasVariants(e.target.checked)}
                      className="w-4 h-4 accent-orange-600 rounded"
                    />
                    Enable Sizes (Regular / Medium / Large)
                  </label>
                </div>

                {hasVariants ? (
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div>
                      <label className="text-[10px] text-gray-400 font-bold block mb-1">Regular / Small (₹) *</label>
                      <input
                        type="number"
                        placeholder="e.g. 149"
                        value={priceRegular}
                        onChange={(e) => {
                          setPriceRegular(e.target.value);
                          setProdBasePrice(e.target.value);
                        }}
                        className="w-full bg-[#1C1C1C] border border-white/10 rounded-xl p-2.5 text-xs text-white font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 font-bold block mb-1">Medium (₹)</label>
                      <input
                        type="number"
                        placeholder="e.g. 299"
                        value={priceMedium}
                        onChange={(e) => setPriceMedium(e.target.value)}
                        className="w-full bg-[#1C1C1C] border border-white/10 rounded-xl p-2.5 text-xs text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 font-bold block mb-1">Large (₹)</label>
                      <input
                        type="number"
                        placeholder="e.g. 449"
                        value={priceLarge}
                        onChange={(e) => setPriceLarge(e.target.value)}
                        className="w-full bg-[#1C1C1C] border border-white/10 rounded-xl p-2.5 text-xs text-white font-bold"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-[10px] text-gray-400 font-bold block mb-1">Single Flat Price (₹) *</label>
                    <input
                      type="number"
                      placeholder="e.g. 199"
                      value={priceRegular}
                      onChange={(e) => {
                        setPriceRegular(e.target.value);
                        setProdBasePrice(e.target.value);
                      }}
                      className="w-full bg-[#1C1C1C] border border-white/10 rounded-xl p-2.5 text-xs text-white font-bold"
                      required
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-300 block mb-1">Description / Ingredients</label>
                <textarea
                  placeholder="Fresh mozzarella, signature sauce, and classic crust."
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  className="w-full bg-[#2A2A2A] border border-white/10 rounded-xl p-2.5 text-xs text-white h-16"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-300 block mb-1">Pizza Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (f) setProdImage(await compress(f, 600));
                  }}
                  className="w-full text-xs text-gray-400 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:bg-orange-600 file:text-white"
                />
                {prodImage && <img src={prodImage} alt="" className="w-16 h-16 rounded-xl object-cover border border-orange-500 mt-2" />}
              </div>

              {/* Veg / Non-Veg Toggle */}
              <div className="pt-1">
                <label className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/5 cursor-pointer">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${prodIsVeg ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    {prodIsVeg ? 'Vegetarian (Veg 🟢)' : 'Non-Vegetarian (🔴)'}
                  </span>
                  <input
                    type="checkbox"
                    checked={prodIsVeg}
                    onChange={(e) => setProdIsVeg(e.target.checked)}
                    className="w-4 h-4 accent-green-500"
                  />
                </label>
              </div>

              {/* Form JSX for Branch Availability Selection: */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-300 block">Available In Branches:</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => toggleBranchSelection('ALL')}
                    className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                      selectedBranchesForItem.includes('ALL') 
                        ? 'bg-orange-600 text-white border-orange-500' 
                        : 'bg-[#2A2A2A] text-gray-400 border-white/10'
                    }`}
                  >
                    🌐 All Stores
                  </button>
                  {(availableBranches.length > 0 ? availableBranches : branches).map((b) => {
                    const isSelected = selectedBranchesForItem.includes(b.id);
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => toggleBranchSelection(b.id)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                          isSelected 
                            ? 'bg-green-600 text-white border-green-500' 
                            : 'bg-[#2A2A2A] text-gray-400 border-white/10'
                        }`}
                      >
                        📍 {b.name} ({b.city})
                      </button>
                    );
                  })}
                </div>
              </div>

              <button type="submit" className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 rounded-xl text-xs font-black shadow-lg">
                🚀 ADD PRODUCT TO MENU
              </button>
            </form>

            {/* Live Products List in Tab 2 */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              <h3 className="text-xs font-black text-gray-300">Live Menu Items in DB ({menuItems.length})</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {menuItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-[#242424] rounded-2xl border border-white/10">
                    <div className="flex items-center gap-3">
                      <img src={item.image || item.imageUrl || 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=500'} alt={item.name} className="w-12 h-12 rounded-xl object-cover" />
                      <div>
                        <h4 className="text-xs font-black text-white">{item.name}</h4>
                        <span className="text-[10px] text-orange-400 font-bold">₹{item.price} • {item.categoryName}</span>
                        <span className="text-[9px] text-gray-400 block">Branches: {typeof item.branchIds === 'string' ? item.branchIds : JSON.stringify(item.branchIds || ['ALL'])}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleDeleteMenuItem(item.id)}
                      className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600 border border-red-500/40 text-red-400 hover:text-white rounded-xl text-xs font-black transition-all"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BANNERS SLIDER */}
        {activeTab === 'BANNERS' && (
          <div className="bg-[#1C1C1C] p-5 rounded-2xl border border-white/10 space-y-4">
            <div>
              <h2 className="text-base font-black text-orange-400">+ Add Promo Slider Banner</h2>
              <p className="text-[11px] text-gray-400">Recommended Size: 1200 x 600 px (2:1 Ratio)</p>
            </div>
            <form onSubmit={handleSaveBanner} className="space-y-3">
              <input
                type="text"
                placeholder="Banner Title / Offer Tag"
                value={bannerTitle}
                onChange={(e) => setBannerTitle(e.target.value)}
                className="w-full bg-[#2A2A2A] border border-white/10 rounded-xl p-2.5 text-xs text-white"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-xs text-gray-400 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:bg-orange-600 file:text-white"
              />
              {(bannerImageBase64 || bannerImage) && (
                <img src={bannerImageBase64 || bannerImage || ''} alt="" className="w-full max-h-36 rounded-xl object-cover border border-orange-500" />
              )}
              <button type="submit" className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 rounded-xl text-xs font-black">
                💾 SAVE BANNER
              </button>
            </form>

            <div className="pt-4 border-t border-white/10 space-y-2">
              <p className="text-xs font-black text-gray-400">Active Banners ({(adminBanners.length || banners.length)})</p>
              {(adminBanners.length > 0 ? adminBanners : banners).map((b) => (
                <div key={b.id} className="flex items-center justify-between p-3 bg-[#262626] rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <img src={b.image || b.imageUrl || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200'} alt="" className="w-20 h-10 rounded-lg object-cover" />
                    <span className="text-xs font-bold text-white">{b.title}</span>
                  </div>
                  <button 
                    onClick={() => handleDeleteBanner(b.id)} 
                    className="text-red-400 hover:text-red-300 text-xs px-2 py-1 cursor-pointer"
                    title="Delete Banner"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: SIDES & BEVERAGES MANAGEMENT */}
        {activeTab === 'BEVERAGES' && (
          <div className="space-y-6">
            <div className="bg-[#1C1C1C] border border-white/10 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-amber-400 flex items-center gap-2">
                  <span>🍟</span> Manage Sides &amp; Beverages ({addonList.length})
                </h3>
                <button
                  onClick={loadAddonsInAdmin}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 text-xs rounded-xl font-bold text-gray-300 cursor-pointer"
                >
                  🔄 Refresh
                </button>
              </div>
              
              <form onSubmit={handleAddAddon} className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <select 
                  value={newAddonType} 
                  onChange={(e: any) => setNewAddonType(e.target.value)}
                  className="bg-[#2A2A2A] text-white p-2.5 rounded-xl text-xs font-bold border border-white/10"
                >
                  <option value="SIDE">Side (Fries / Dips)</option>
                  <option value="BEVERAGE">Beverage (Cold Drink / Coffee)</option>
                </select>
                <input 
                  type="text" 
                  placeholder="Name (e.g. Saucy Fries)" 
                  value={newAddonName} 
                  onChange={e => setNewAddonName(e.target.value)} 
                  className="bg-[#2A2A2A] text-white p-2.5 rounded-xl text-xs border border-white/10" 
                  required
                />
                <input 
                  type="number" 
                  placeholder="Extra Price (₹)" 
                  value={newAddonPrice} 
                  onChange={e => setNewAddonPrice(e.target.value)} 
                  className="bg-[#2A2A2A] text-white p-2.5 rounded-xl text-xs border border-white/10" 
                />
                <button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white font-black text-xs rounded-xl py-2.5 cursor-pointer transition">
                  + Add Item
                </button>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
                {addonList.map(item => (
                  <div key={item.id} className="p-3 bg-[#242424] rounded-2xl border border-white/10 flex items-center justify-between gap-2.5 hover:border-orange-500/40 transition">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img 
                        src={item.image || 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=200'} 
                        alt={item.name} 
                        className="w-10 h-10 rounded-lg object-cover shrink-0" 
                        onError={(e) => {
                          (e.target as HTMLElement).setAttribute('src', 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=200');
                        }}
                      />
                      <div className="min-w-0">
                        <span className="text-[10px] text-orange-400 font-bold block">{item.type}</span>
                        <h4 className="text-xs font-black text-white truncate">{item.name}</h4>
                        <span className="text-[11px] text-gray-400 font-bold">+₹{item.price}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteAddon(item.id, item.name)}
                      className="text-red-400 hover:text-red-300 text-xs p-1 cursor-pointer"
                      title="Delete Addon"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Global Beverage Section */}
            <div className="bg-[#1C1C1C] p-5 rounded-2xl border border-white/10 space-y-4">
              <h2 className="text-base font-black text-orange-400">+ Add Global Beverage / Drink</h2>
              <form onSubmit={handleSaveBeverage} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Drink Name (e.g. Sprite Can 300ml)"
                    value={bevName}
                    onChange={(e) => setBevName(e.target.value)}
                    className="w-full bg-[#2A2A2A] border border-white/10 rounded-xl p-2.5 text-xs text-white"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Add-on Price (₹)"
                    value={bevPrice}
                    onChange={(e) => setBevPrice(e.target.value)}
                    className="w-full bg-[#2A2A2A] border border-white/10 rounded-xl p-2.5 text-xs text-white"
                    required
                  />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (f) setBevImage(await compress(f, 400));
                  }}
                  className="w-full text-xs text-gray-400 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:bg-orange-600 file:text-white"
                />
                {bevImage && <img src={bevImage} alt="" className="w-12 h-12 rounded-xl object-cover border border-orange-500" />}
                <button type="submit" className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 rounded-xl text-xs font-black cursor-pointer">
                  💾 SAVE BEVERAGE
                </button>
              </form>

              <div className="pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {beverages.map((bv) => (
                  <div key={bv.id} className="flex items-center justify-between p-2.5 bg-[#262626] rounded-xl border border-white/5">
                    <div className="flex items-center gap-2.5">
                      <img src={bv.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <p className="text-xs font-bold">{bv.name}</p>
                        <p className="text-[11px] text-orange-400 font-black">+₹{bv.price}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(`/api/beverages?id=${bv.id}`)} className="text-red-400 text-xs px-2 py-1 cursor-pointer">🗑️</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: COUPONS & AFFILIATES */}
        {activeTab === 'COUPONS_AFFILIATE' && (
          <div className="space-y-6">
            {/* A. Standard Promo Code Creator */}
            <div className="bg-[#1C1C1C] p-5 rounded-2xl border border-white/10 space-y-3">
              <h3 className="text-base font-black text-orange-400">🎟️ Create General Promo Code</h3>
              <form onSubmit={handleCreateCoupon} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Coupon Code (e.g. FLAT50)"
                    value={coupCode}
                    onChange={(e) => setCoupCode(e.target.value)}
                    className="bg-[#2A2A2A] border border-white/10 p-2.5 rounded-xl text-xs text-white uppercase"
                    required
                  />
                  <select
                    value={coupType}
                    onChange={(e) => setCoupType(e.target.value)}
                    className="bg-[#2A2A2A] border border-white/10 p-2.5 rounded-xl text-xs text-white"
                  >
                    <option value="PERCENT">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (₹)</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Discount Value (e.g. 10% ya 50)"
                    value={coupVal}
                    onChange={(e) => setCoupVal(e.target.value)}
                    className="bg-[#2A2A2A] border border-white/10 p-2.5 rounded-xl text-xs text-white"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Min Order Amount (₹)"
                    value={coupMin}
                    onChange={(e) => setCoupMin(e.target.value)}
                    className="bg-[#2A2A2A] border border-white/10 p-2.5 rounded-xl text-xs text-white"
                  />
                </div>

                {/* Scope selector for Promo */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <label className="text-xs font-bold text-gray-300 block">Apply Coupon On:</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['ALL', 'CATEGORY', 'COMBO', 'ITEM'].map((sc) => (
                      <button
                        key={sc}
                        type="button"
                        onClick={() => { setScopeType(sc as any); setSelectedScopeIds([]); }}
                        className={`py-1.5 rounded-lg text-xs font-bold border transition ${
                          scopeType === sc ? 'bg-orange-600 border-orange-500 text-white' : 'bg-[#2A2A2A] border-white/10 text-gray-400 hover:text-white'
                        }`}
                      >
                        {sc === 'ALL' ? 'Full Menu' : sc === 'CATEGORY' ? 'Category' : sc === 'COMBO' ? 'Combos' : 'Specific Item'}
                      </button>
                    ))}
                  </div>

                  {/* Multi-selection pill list when not ALL */}
                  {(scopeType === 'CATEGORY' || scopeType === 'COMBO') && (
                    <div className="flex flex-wrap gap-1.5 p-2 bg-black/40 rounded-xl max-h-28 overflow-y-auto">
                      {categories.map((c) => (
                        <span
                          key={c.id}
                          onClick={() => toggleScopeId(c.name)}
                          className={`px-2 py-1 rounded-md text-[11px] font-bold cursor-pointer transition ${
                            selectedScopeIds.includes(c.name) ? 'bg-green-600 text-white' : 'bg-[#333] text-gray-300 hover:bg-[#444]'
                          }`}
                        >
                          {c.name} {selectedScopeIds.includes(c.name) && '✓'}
                        </span>
                      ))}
                    </div>
                  )}

                  {scopeType === 'ITEM' && (
                    <div className="flex flex-wrap gap-1.5 p-2 bg-black/40 rounded-xl max-h-28 overflow-y-auto">
                      {menuItems.map((m) => (
                        <span
                          key={m.id}
                          onClick={() => toggleScopeId(m.name || m.id)}
                          className={`px-2 py-1 rounded-md text-[11px] font-bold cursor-pointer transition ${
                            (selectedScopeIds.includes(m.name) || selectedScopeIds.includes(m.id)) ? 'bg-green-600 text-white' : 'bg-[#333] text-gray-300 hover:bg-[#444]'
                          }`}
                        >
                          {m.name} {(selectedScopeIds.includes(m.name) || selectedScopeIds.includes(m.id)) && '✓'}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <button type="submit" className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 rounded-xl text-xs font-black shadow-lg">
                  💾 SAVE PROMO CODE
                </button>
              </form>

              {/* Active Coupons List */}
              <div className="pt-3 border-t border-white/10">
                <p className="text-xs font-black text-gray-400 mb-2">Existing Promo Codes ({coupons.length})</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {coupons.map((c) => (
                    <div key={c.id} className="p-3 bg-[#262626] rounded-xl border border-white/5 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-orange-400 text-sm tracking-wider">{c.code}</span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/10 text-amber-300">
                            {c.applicableType || 'ALL'}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {c.discountType === 'PERCENT' ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT OFF`}
                          {Number(c.minOrderAmount) > 0 && ` • Min ₹${c.minOrderAmount}`}
                        </p>
                      </div>
                      <button onClick={() => handleDelete(`/api?id=${c.id}&type=COUPON`)} className="text-red-400 hover:text-red-300 px-2 py-1">
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* B. Affiliate Influencer Account Creator */}
            <div className="bg-[#1C1C1C] p-5 rounded-2xl border border-white/10 space-y-3">
              <h3 className="text-base font-black text-purple-400">🤝 Create Affiliate / Influencer Partner</h3>
              <form onSubmit={handleCreateAffiliate} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Partner Name"
                    value={affName}
                    onChange={(e) => setAffName(e.target.value)}
                    className="bg-[#2A2A2A] border border-white/10 p-2.5 rounded-xl text-xs text-white"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Referral Code (e.g. VIP10)"
                    value={affCode}
                    onChange={(e) => setAffCode(e.target.value)}
                    className="bg-[#2A2A2A] border border-white/10 p-2.5 rounded-xl text-xs text-white uppercase"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="email"
                    placeholder="Partner Email (Login ID)"
                    value={affEmail}
                    onChange={(e) => setAffEmail(e.target.value)}
                    className="bg-[#2A2A2A] border border-white/10 p-2.5 rounded-xl text-xs text-white"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Partner Password"
                    value={affPass}
                    onChange={(e) => setAffPass(e.target.value)}
                    className="bg-[#2A2A2A] border border-white/10 p-2.5 rounded-xl text-xs text-white"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Customer Discount (%)"
                    value={affDiscount}
                    onChange={(e) => setAffDiscount(e.target.value)}
                    className="bg-[#2A2A2A] border border-white/10 p-2.5 rounded-xl text-xs text-white"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Partner Commission (%)"
                    value={affComm}
                    onChange={(e) => setAffComm(e.target.value)}
                    className="bg-[#2A2A2A] border border-white/10 p-2.5 rounded-xl text-xs text-white"
                    required
                  />
                </div>

                {/* Scope selector for Affiliate */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <label className="text-xs font-bold text-gray-300 block">Apply Referral Code On:</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['ALL', 'CATEGORY', 'COMBO', 'ITEM'].map((sc) => (
                      <button
                        key={sc}
                        type="button"
                        onClick={() => { setAffScopeType(sc as any); setAffSelectedScopeIds([]); }}
                        className={`py-1.5 rounded-lg text-xs font-bold border transition ${
                          affScopeType === sc ? 'bg-purple-600 border-purple-500 text-white' : 'bg-[#2A2A2A] border-white/10 text-gray-400 hover:text-white'
                        }`}
                      >
                        {sc === 'ALL' ? 'Full Menu' : sc === 'CATEGORY' ? 'Category' : sc === 'COMBO' ? 'Combos' : 'Specific Item'}
                      </button>
                    ))}
                  </div>

                  {/* Multi-selection pill list when not ALL */}
                  {(affScopeType === 'CATEGORY' || affScopeType === 'COMBO') && (
                    <div className="flex flex-wrap gap-1.5 p-2 bg-black/40 rounded-xl max-h-28 overflow-y-auto">
                      {categories.map((c) => (
                        <span
                          key={c.id}
                          onClick={() => toggleAffScopeId(c.name)}
                          className={`px-2 py-1 rounded-md text-[11px] font-bold cursor-pointer transition ${
                            affSelectedScopeIds.includes(c.name) ? 'bg-purple-600 text-white' : 'bg-[#333] text-gray-300 hover:bg-[#444]'
                          }`}
                        >
                          {c.name} {affSelectedScopeIds.includes(c.name) && '✓'}
                        </span>
                      ))}
                    </div>
                  )}

                  {affScopeType === 'ITEM' && (
                    <div className="flex flex-wrap gap-1.5 p-2 bg-black/40 rounded-xl max-h-28 overflow-y-auto">
                      {menuItems.map((m) => (
                        <span
                          key={m.id}
                          onClick={() => toggleAffScopeId(m.name || m.id)}
                          className={`px-2 py-1 rounded-md text-[11px] font-bold cursor-pointer transition ${
                            (affSelectedScopeIds.includes(m.name) || affSelectedScopeIds.includes(m.id)) ? 'bg-purple-600 text-white' : 'bg-[#333] text-gray-300 hover:bg-[#444]'
                          }`}
                        >
                          {m.name} {(affSelectedScopeIds.includes(m.name) || affSelectedScopeIds.includes(m.id)) && '✓'}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <button type="submit" className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 rounded-xl text-xs font-black shadow-lg">
                  🚀 CREATE AFFILIATE ACCOUNT
                </button>
              </form>

              {/* Active Affiliates List */}
              <div className="pt-3 border-t border-white/10">
                <p className="text-xs font-black text-gray-400 mb-2">Active Affiliate Partners ({affiliates.length})</p>
                  {affiliates.map((aff: any) => {
                    const cpnList = aff.coupons && aff.coupons.length > 0 ? aff.coupons : (aff.couponCode ? [{ code: aff.couponCode, discountValue: 10 }] : []);
                    return (
                      <div
                        key={aff.id}
                        className="p-3.5 bg-[#262626] hover:bg-[#2c2c2c] rounded-xl border border-white/5 flex flex-wrap justify-between items-center text-xs gap-3 transition cursor-pointer"
                        onClick={() => openPartnerDrilldown(aff)}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-white text-sm">{aff.name}</span>
                            <span className="text-[10px] text-gray-400 font-bold">({cpnList.length} Coupons)</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 py-0.5">
                            {cpnList.map((c: any) => (
                              <span key={c.id || c.code} className="px-2 py-0.5 rounded-md bg-orange-500/20 text-orange-400 font-black text-[10px]">
                                🎟️ {c.code} ({c.discountValue || 10}% OFF)
                              </span>
                            ))}
                          </div>
                          <p className="text-gray-400 text-[11px]">{aff.email} | UPI: {aff.payoutUpi || 'Not set'}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="font-black text-green-400 text-sm">₹{aff.realtimeEarnings || 0} Earned</span>
                            <p className="text-[10px] text-gray-400">{aff.deliveredOrdersCount || 0} Delivered Orders</p>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); openPartnerDrilldown(aff); }}
                            className="px-3 py-1.5 bg-purple-600/30 hover:bg-purple-600 text-purple-300 hover:text-white rounded-lg text-[10px] font-black transition"
                          >
                            📊 Drilldown
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(`/api/affiliate?id=${aff.id}`); }}
                            className="text-red-400 hover:text-red-300 p-1.5 hover:bg-red-500/10 rounded-lg transition"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: MENU MODIFIER */}
        {activeTab === 'MENU_MODIFIER' && (
          <div className="bg-[#1C1C1C] p-5 rounded-2xl border border-white/10 space-y-3">
            <h2 className="text-base font-black text-orange-400">✏️ Live Menu Modifier ({menuItems.length} Products)</h2>
            <div className="space-y-2">
              {menuItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-[#242424] rounded-2xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <img src={item.image || item.imageUrl || 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=500'} alt={item.name} className="w-12 h-12 rounded-xl object-cover" />
                    <div>
                      <h4 className="text-xs font-black text-white">{item.name}</h4>
                      <span className="text-[10px] text-orange-400 font-bold">₹{item.price} • {item.categoryName}</span>
                      <span className="text-[9px] text-gray-400 block">Branches: {typeof item.branchIds === 'string' ? item.branchIds : JSON.stringify(item.branchIds || ['ALL'])}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDeleteMenuItem(item.id)}
                    className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600 border border-red-500/40 text-red-400 hover:text-white rounded-xl text-xs font-black transition-all"
                  >
                    🗑️ Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: LIVE ORDERS */}
        {activeTab === 'LIVE_ORDERS' && (
          <div className="bg-[#1C1C1C] p-5 rounded-2xl border border-white/10 space-y-3">
            {ordersError ? (
              <div className="p-4 bg-red-950/70 border-2 border-red-500 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-red-400 font-mono text-xs font-bold">
                  <span className="text-white font-black text-sm">❌ DB Error:</span>
                  <span className="text-red-300 font-mono text-xs break-all">{ordersError}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={refreshOrders}
                    className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-black cursor-pointer shadow"
                  >
                    🔄 Retry Fetch
                  </button>
                  <button
                    onClick={handleTestOrderAndAlarm}
                    className="px-3 py-1 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-black cursor-pointer shadow"
                  >
                    🧪 Test Order + Alarm
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <h2 className="text-base font-black text-orange-400">📦 All Orders in DB ({ordersList.length})</h2>
                <button
                  onClick={handleTestOrderAndAlarm}
                  className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
                >
                  🧪 Test Order + Alarm
                </button>
              </div>
            )}
            <div className="space-y-2">
              {!ordersError && (ordersList.length > 0 ? ordersList : orders).map((ord) => (
                <div key={ord.id} className="p-3 bg-[#262626] rounded-xl border border-white/5 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-black text-orange-400">#{ord.orderNumber}</span> - {ord.customerName} ({ord.phone || ord.customerPhone})
                    <p className="text-gray-400 text-[11px]">{ord.address || ord.customerAddress}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] bg-orange-500/20 text-orange-300 font-bold px-2 py-0.5 rounded">
                        🏢 {ord.branchName || 'Mahmudabad Main Branch'}
                      </span>
                      {ord.couponCode && (
                        <span className="text-[10px] text-purple-400 font-bold">
                          Coupon: {ord.couponCode} {ord.affiliateCommissionEarned ? `(+₹${ord.affiliateCommissionEarned} Comm.)` : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-sm text-white">₹{ord.totalAmount}</span>
                    <p className="text-[10px] uppercase font-bold text-gray-300">{ord.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: BRANCHES & STAFF */}
        {activeTab === 'BRANCHES' && (
          <div className="space-y-6">
            
            {/* Top Grid: Create Branch + Create Staff */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Form 1: Add Branch */}
              <div className="bg-[#1C1C1C] p-5 rounded-2xl border border-white/10 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏢</span>
                  <h3 className="text-base font-black text-orange-400">+ Add New Store Branch</h3>
                </div>
                <form onSubmit={handleCreateBranch} className="space-y-3">
                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1 font-bold">BRANCH NAME</label>
                    <input
                      type="text"
                      placeholder="e.g. Shivalik Nagar Haridwar Branch"
                      value={branchName}
                      onChange={(e) => setBranchName(e.target.value)}
                      className="w-full bg-[#2A2A2A] border border-white/10 rounded-xl p-2.5 text-xs text-white"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1 font-bold">CITY</label>
                      <input
                        type="text"
                        placeholder="e.g. Haridwar"
                        value={branchCity}
                        onChange={(e) => setBranchCity(e.target.value)}
                        className="w-full bg-[#2A2A2A] border border-white/10 rounded-xl p-2.5 text-xs text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1 font-bold">STORE PHONE</label>
                      <input
                        type="text"
                        placeholder="9876543210"
                        value={branchPhone}
                        onChange={(e) => setBranchPhone(e.target.value)}
                        className="w-full bg-[#2A2A2A] border border-white/10 rounded-xl p-2.5 text-xs text-white"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 block mb-1 font-bold">OUTLET FULL ADDRESS</label>
                    <textarea
                      placeholder="Complete street address, cluster, sector, landmark"
                      value={branchAddress}
                      onChange={(e) => setBranchAddress(e.target.value)}
                      className="w-full bg-[#2A2A2A] border border-white/10 rounded-xl p-2.5 text-xs text-white h-16"
                      required
                    />
                  </div>

                  {/* GPS & Delivery Radius */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1 font-bold">LATITUDE</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="27.2894"
                        value={bLat}
                        onChange={(e) => setBLat(e.target.value)}
                        className="w-full bg-[#2A2A2A] border border-white/10 rounded-xl p-2 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1 font-bold">LONGITUDE</label>
                      <input
                        type="number"
                        step="any"
                        placeholder="81.1278"
                        value={bLng}
                        onChange={(e) => setBLng(e.target.value)}
                        className="w-full bg-[#2A2A2A] border border-white/10 rounded-xl p-2 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1 font-bold">RADIUS (KM)</label>
                      <input
                        type="number"
                        placeholder="10"
                        value={bRadius}
                        onChange={(e) => setBRadius(e.target.value)}
                        className="w-full bg-[#2A2A2A] border border-white/10 rounded-xl p-2 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={fetchCurrentAdminGps}
                    className="w-full py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>📍</span> Use My Current Location (GPS)
                  </button>

                  <button
                    type="submit"
                    disabled={creatingBranch}
                    className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-black text-xs uppercase rounded-xl shadow-lg transition cursor-pointer disabled:opacity-50"
                  >
                    {creatingBranch ? 'Creating Branch...' : '💾 SAVE NEW BRANCH'}
                  </button>
                </form>
              </div>

              {/* Form 2: Add Staff (Manager / Rider) */}
              <div className="bg-[#1C1C1C] p-5 rounded-2xl border border-white/10 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">👥</span>
                  <h3 className="text-base font-black text-purple-400">+ Add Staff (Manager / Rider)</h3>
                </div>
                <form onSubmit={handleCreateStaff} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1 font-bold">FULL NAME</label>
                      <input
                        type="text"
                        placeholder="e.g. Vikram Singh"
                        value={staffName}
                        onChange={(e) => setStaffName(e.target.value)}
                        className="w-full bg-[#2A2A2A] border border-white/10 rounded-xl p-2.5 text-xs text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1 font-bold">ASSIGNED BRANCH</label>
                      <select
                        value={staffBranchId}
                        onChange={(e) => setStaffBranchId(e.target.value)}
                        className="w-full bg-[#2A2A2A] border border-white/10 rounded-xl p-2.5 text-xs text-white"
                        required
                      >
                        {branches.map(b => (
                          <option key={b.id} value={b.id}>{b.name} ({b.city})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1 font-bold">EMAIL (LOGIN ID)</label>
                      <input
                        type="email"
                        placeholder="name@hackypizza.com"
                        value={staffEmail}
                        onChange={(e) => setStaffEmail(e.target.value)}
                        className="w-full bg-[#2A2A2A] border border-white/10 rounded-xl p-2.5 text-xs text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1 font-bold">PASSWORD</label>
                      <input
                        type="text"
                        placeholder="password123"
                        value={staffPassword}
                        onChange={(e) => setStaffPassword(e.target.value)}
                        className="w-full bg-[#2A2A2A] border border-white/10 rounded-xl p-2.5 text-xs text-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1 font-bold">ROLE</label>
                      <select
                        value={staffRole}
                        onChange={(e: any) => setStaffRole(e.target.value)}
                        className="w-full bg-[#2A2A2A] border border-white/10 rounded-xl p-2.5 text-xs text-white"
                      >
                        <option value="STORE_MANAGER">🏪 Store Manager (Alarms & Prep)</option>
                        <option value="RIDER">🛵 Rider Fleet (Deliveries)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 block mb-1 font-bold">PHONE NUMBER</label>
                      <input
                        type="text"
                        placeholder="9876543210"
                        value={staffPhone}
                        onChange={(e) => setStaffPhone(e.target.value)}
                        className="w-full bg-[#2A2A2A] border border-white/10 rounded-xl p-2.5 text-xs text-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={creatingStaff}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs uppercase rounded-xl shadow-lg transition cursor-pointer disabled:opacity-50"
                  >
                    {creatingStaff ? 'Creating Staff...' : '🚀 CREATE STAFF CREDENTIALS'}
                  </button>
                </form>
              </div>

            </div>

            {/* Staff Directory Table */}
            <div className="bg-[#1C1C1C] border border-white/10 rounded-3xl p-5 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-black text-amber-400">👥 Staff & Manager Directory</h3>
                  <p className="text-[11px] text-gray-400">Sabhi branches ke staff members, roles aur unke active passwords</p>
                </div>
                <span className="text-xs bg-orange-600/30 border border-orange-500/50 text-orange-300 font-bold px-3 py-1 rounded-full">
                  Total Staff: {allStaff.length}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400 font-bold">
                      <th className="py-2.5 px-3">Staff Name</th>
                      <th className="py-2.5 px-3">Role</th>
                      <th className="py-2.5 px-3">Assigned Branch</th>
                      <th className="py-2.5 px-3">Email / Phone</th>
                      <th className="py-2.5 px-3">Active Password</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {allStaff.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-gray-500 font-bold">
                          Koi staff member nahi mila. Upar diye form se Staff create karein.
                        </td>
                      </tr>
                    ) : (
                      allStaff.map((st) => (
                        <tr key={st.id} className="hover:bg-white/[0.02]">
                          <td className="py-3 px-3 font-black text-white">{st.name}</td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              st.role === 'MANAGER' || st.role === 'STORE_MANAGER' ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40' :
                              st.role === 'RIDER' ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40' :
                              'bg-amber-600/30 text-amber-300 border border-amber-500/40'
                            }`}>
                              {st.role}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-orange-300 font-bold">{st.branchName || 'Not Assigned'}</td>
                          <td className="py-3 px-3 text-gray-400 font-mono text-[11px]">{st.email} {st.phone ? `(${st.phone})` : ''}</td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs bg-black px-2 py-1 rounded border border-white/10 text-green-400">
                                {showPasswords[st.id] ? st.password : '••••••••'}
                              </span>
                              <button
                                type="button"
                                onClick={() => togglePass(st.id)}
                                className="text-gray-400 hover:text-white text-xs cursor-pointer p-0.5"
                              >
                                {showPasswords[st.id] ? '🙈' : '👁️'}
                              </button>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => handleDeleteStaff(st.id, st.name)}
                              className="px-2.5 py-1 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Active Branches & Team Display */}
            <div className="bg-[#1C1C1C] p-5 rounded-2xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-white">Active Branches & Assigned Staff</h3>
                  <p className="text-xs text-gray-400">Isolated order sirens and staff credentials per branch</p>
                </div>
                <span className="text-xs font-black bg-white/10 px-3 py-1 rounded-full text-orange-400">
                  {branches.length} Branches • {staffMembers.length} Staff
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {branches.map(branch => {
                  const branchStaff = staffMembers.filter(s => s.branchId === branch.id);
                  const managers = branchStaff.filter(s => s.role === 'STORE_MANAGER');
                  const riders = branchStaff.filter(s => s.role === 'RIDER');

                  return (
                    <div key={branch.id} className="bg-[#262626] rounded-2xl border border-white/5 p-4 space-y-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-orange-500/20 text-orange-400">
                              {branch.city}
                            </span>
                            <h4 className="text-base font-black text-white mt-1">{branch.name}</h4>
                            <p className="text-xs text-gray-400 mt-0.5">{branch.address}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px]">
                              <span className="text-gray-400">📞 {branch.phone}</span>
                              <span className="text-emerald-400 font-mono font-bold">📍 {branch.latitude || '27.2894'}, {branch.longitude || '81.1278'}</span>
                              <span className="bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
                                🎯 Max Radius: {branch.deliveryRadiusKm || 10} KM
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteBranch(branch.id)}
                            className="text-red-400 hover:text-red-300 p-1.5 hover:bg-red-500/10 rounded-lg transition"
                            title="Delete this branch"
                          >
                            🗑️
                          </button>
                        </div>

                        {/* Attached Staff */}
                        <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                            Assigned Team Members ({branchStaff.length})
                          </p>

                          {branchStaff.length === 0 ? (
                            <p className="text-[11px] text-gray-500 italic">No staff assigned yet.</p>
                          ) : (
                            <div className="space-y-1.5">
                              {branchStaff.map(st => (
                                <div key={st.id} className="p-2 bg-[#1A1A1A] rounded-xl border border-white/5 flex items-center justify-between text-xs">
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                                        st.role === 'STORE_MANAGER' ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
                                      }`}>
                                        {st.role === 'STORE_MANAGER' ? '🏪 Manager' : '🛵 Rider'}
                                      </span>
                                      <span className="font-bold text-white truncate">{st.name}</span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-mono mt-0.5 truncate">{st.email}</p>
                                  </div>
                                  <button
                                    onClick={() => handleDeleteStaff(st.id)}
                                    className="text-red-400 hover:text-red-300 p-1 hover:bg-red-500/10 rounded transition shrink-0 ml-2"
                                    title="Delete staff member"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Quick Portal Switch Link */}
                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                        <span className="text-gray-400">
                          {managers.length} Manager{managers.length === 1 ? '' : 's'} • {riders.length} Rider{riders.length === 1 ? '' : 's'}
                        </span>
                        <Link
                          href="/manager"
                          className="text-orange-400 hover:underline font-bold"
                        >
                          Open Store Manager &gt;
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Billing & Taxes Manager Card */}
            <div className="bg-[#1C1C1C] p-5 rounded-2xl border border-white/10 space-y-4 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">💳</span>
                  <div>
                    <h3 className="text-base font-black text-white">Dynamic Billing & Taxes Manager</h3>
                    <p className="text-xs text-gray-400">Live charges calculated dynamically across customer cart drawer & checkout</p>
                  </div>
                </div>
                <span className="text-[10px] bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full font-black uppercase tracking-wider">
                  Live Dynamic Checkout
                </span>
              </div>

              <form onSubmit={handleSaveBillingSettings} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                  <div className="bg-[#242424] p-3 rounded-xl border border-white/5 space-y-1">
                    <label className="text-[10px] text-gray-400 block font-bold uppercase">GST & Taxes (%)</label>
                    <input
                      type="number"
                      step="any"
                      value={gst}
                      onChange={(e) => setGst(e.target.value)}
                      className="w-full bg-[#181818] border border-white/10 rounded-lg p-2 text-xs text-white font-mono font-bold focus:border-orange-500 focus:outline-hidden"
                      required
                    />
                    <p className="text-[9px] text-gray-500">Applied on food subtotal</p>
                  </div>

                  <div className="bg-[#242424] p-3 rounded-xl border border-white/5 space-y-1">
                    <label className="text-[10px] text-gray-400 block font-bold uppercase">Delivery Fee (₹)</label>
                    <input
                      type="number"
                      value={deliveryFee}
                      onChange={(e) => setDeliveryFee(e.target.value)}
                      className="w-full bg-[#181818] border border-white/10 rounded-lg p-2 text-xs text-white font-mono font-bold focus:border-orange-500 focus:outline-hidden"
                      required
                    />
                    <p className="text-[9px] text-gray-500">Standard distance fee</p>
                  </div>

                  <div className="bg-[#242424] p-3 rounded-xl border border-white/5 space-y-1">
                    <label className="text-[10px] text-gray-400 block font-bold uppercase">Free Delivery Above (₹)</label>
                    <input
                      type="number"
                      value={freeAbove}
                      onChange={(e) => setFreeAbove(e.target.value)}
                      className="w-full bg-[#181818] border border-white/10 rounded-lg p-2 text-xs text-white font-mono font-bold focus:border-orange-500 focus:outline-hidden"
                      required
                    />
                    <p className="text-[9px] text-gray-500">Order threshold for free delivery</p>
                  </div>

                  <div className="bg-[#242424] p-3 rounded-xl border border-white/5 space-y-1">
                    <label className="text-[10px] text-gray-400 block font-bold uppercase">Platform Fee (₹)</label>
                    <input
                      type="number"
                      value={platformFee}
                      onChange={(e) => setPlatformFee(e.target.value)}
                      className="w-full bg-[#181818] border border-white/10 rounded-lg p-2 text-xs text-white font-mono font-bold focus:border-orange-500 focus:outline-hidden"
                      required
                    />
                    <p className="text-[9px] text-gray-500">App maintenance charge</p>
                  </div>

                  <div className="bg-[#242424] p-3 rounded-xl border border-white/5 space-y-1">
                    <label className="text-[10px] text-gray-400 block font-bold uppercase">Packaging Fee (₹)</label>
                    <input
                      type="number"
                      value={packagingFee}
                      onChange={(e) => setPackagingFee(e.target.value)}
                      className="w-full bg-[#181818] border border-white/10 rounded-lg p-2 text-xs text-white font-mono font-bold focus:border-orange-500 focus:outline-hidden"
                      required
                    />
                    <p className="text-[9px] text-gray-500">Thermal box & container packing</p>
                  </div>

                  <div className="bg-[#242424] p-3 rounded-xl border border-white/5 space-y-1">
                    <label className="text-[10px] text-amber-400 block font-bold uppercase">Signup Welcome Bonus (₹)</label>
                    <input
                      type="number"
                      value={welcomeCashback}
                      onChange={(e) => setWelcomeCashback(e.target.value)}
                      className="w-full bg-[#181818] border border-white/10 rounded-lg p-2 text-xs text-white font-mono font-bold focus:border-orange-500 focus:outline-hidden"
                      required
                    />
                    <p className="text-[9px] text-gray-500">Instant cashback credited on new customer registration</p>
                  </div>

                  <div className="bg-[#242424] p-3 rounded-xl border border-white/5 space-y-1">
                    <label className="text-[10px] text-emerald-400 block font-bold uppercase">Post-Delivery Loyalty (%)</label>
                    <input
                      type="number"
                      step="any"
                      value={orderCashback}
                      onChange={(e) => setOrderCashback(e.target.value)}
                      className="w-full bg-[#181818] border border-white/10 rounded-lg p-2 text-xs text-white font-mono font-bold focus:border-orange-500 focus:outline-hidden"
                      required
                    />
                    <p className="text-[9px] text-gray-500">Cashback % credited upon order delivery status</p>
                  </div>

                  <div className="bg-[#242424] p-3 rounded-xl border border-white/5 space-y-1">
                    <label className="text-[10px] text-emerald-400 block font-bold uppercase">Min Order For Cashback (₹)</label>
                    <input
                      type="number"
                      value={minOrderCashback}
                      onChange={(e) => setMinOrderCashback(e.target.value)}
                      className="w-full bg-[#181818] border border-white/10 rounded-lg p-2 text-xs text-white font-mono font-bold focus:border-orange-500 focus:outline-hidden"
                      required
                    />
                    <p className="text-[9px] text-gray-500">Minimum subtotal required to qualify for loyalty cashback</p>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs uppercase rounded-xl shadow-lg transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    {savingSettings ? 'Saving Settings...' : '💾 SAVE BILLING & TAX CHARGES'}
                  </button>
                </div>
              </form>
            </div>

          </div>
        )}

        {/* INTERACTIVE PROFILE DRILLDOWN MODAL */}
        {selectedPartnerProfile && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
            <div className="bg-[#181818] border border-white/10 rounded-3xl max-w-4xl w-full p-5 sm:p-6 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl">
              
              {/* Header */}
              <div className="flex items-start justify-between border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse"></span>
                    <span className="text-xs font-black text-purple-400 uppercase tracking-widest">Affiliate Partner Profile</span>
                  </div>
                  <h2 className="text-2xl font-black text-white mt-1">{selectedPartnerProfile.name}</h2>
                  <p className="text-xs text-gray-400">
                    {selectedPartnerProfile.email} • Base Commission: <strong className="text-orange-400">{selectedPartnerProfile.commissionPercent}%</strong> • UPI: <strong className="text-emerald-400">{selectedPartnerProfile.payoutUpi || 'Not set'}</strong>
                  </p>
                </div>
                <button
                  onClick={() => { setSelectedPartnerProfile(null); setDrilldownData(null); }}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-sm font-black transition"
                >
                  ✕
                </button>
              </div>

              {loadingProfile ? (
                <div className="py-12 text-center text-gray-400 text-sm">
                  Loading partner analytics & order reports...
                </div>
              ) : drilldownData ? (
                <div className="space-y-6">
                  {/* 4 Analytics KPI Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-[#222] p-3.5 rounded-2xl border border-white/5">
                      <span className="text-[10px] font-bold text-gray-400 uppercase block">Settled Earnings</span>
                      <span className="text-xl font-black text-green-400">₹{drilldownData.analytics?.settledEarning ?? 0}</span>
                      <p className="text-[10px] text-gray-500 mt-0.5">Delivered orders only</p>
                    </div>

                    <div className="bg-[#222] p-3.5 rounded-2xl border border-white/5">
                      <span className="text-[10px] font-bold text-gray-400 uppercase block">Delivered Sales</span>
                      <span className="text-xl font-black text-orange-400">₹{drilldownData.analytics?.deliveredSales ?? 0}</span>
                      <p className="text-[10px] text-gray-500 mt-0.5">{drilldownData.analytics?.deliveredOrders ?? 0} delivered orders</p>
                    </div>

                    <div className="bg-[#222] p-3.5 rounded-2xl border border-white/5">
                      <span className="text-[10px] font-bold text-gray-400 uppercase block">Total Orders</span>
                      <span className="text-xl font-black text-white">{drilldownData.analytics?.totalOrders ?? 0}</span>
                      <p className="text-[10px] text-gray-500 mt-0.5">Referred checkouts</p>
                    </div>

                    <div className="bg-[#222] p-3.5 rounded-2xl border border-white/5">
                      <span className="text-[10px] font-bold text-gray-400 uppercase block">Active Coupons</span>
                      <span className="text-xl font-black text-purple-400">{drilldownData.analytics?.totalCoupons ?? 0}</span>
                      <p className="text-[10px] text-gray-500 mt-0.5">Assigned to this email</p>
                    </div>
                  </div>

                  {/* All Coupons Owned Section */}
                  <div className="bg-[#222] p-4 rounded-2xl border border-white/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-orange-400 uppercase tracking-wider">
                        🎟️ Coupons Owned by this Partner ({drilldownData.coupons?.length || 0})
                      </h4>
                    </div>

                    {(!drilldownData.coupons || drilldownData.coupons.length === 0) ? (
                      <p className="text-xs text-gray-500">Koi coupons linked nahi hain.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {drilldownData.coupons.map((cpn: any) => (
                          <div key={cpn.id} className="p-3 bg-[#1A1A1A] rounded-xl border border-white/5 flex items-center justify-between text-xs">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-white text-sm">{cpn.code}</span>
                                <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 font-bold text-[10px]">
                                  {cpn.discountValue}% OFF
                                </span>
                                <span className="px-1.5 py-0.5 rounded bg-white/10 text-gray-300 font-bold text-[9px]">
                                  {cpn.applicableType || 'ALL'}
                                </span>
                              </div>
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                Commission: <strong className="text-green-400">{cpn.commissionPercent || selectedPartnerProfile.commissionPercent || 10}%</strong>
                              </p>
                            </div>
                            <button
                              onClick={() => handleDeletePartnerCoupon(cpn.id)}
                              className="text-red-400 hover:text-red-300 p-1.5 hover:bg-red-500/10 rounded-lg transition"
                              title="Delete this coupon"
                            >
                              🗑️
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Quick Add Another Coupon Form */}
                    <form onSubmit={handleAddCouponToPartner} className="pt-3 border-t border-white/10 flex flex-wrap items-end gap-2 text-xs">
                      <div className="flex-1 min-w-[120px]">
                        <label className="text-[10px] text-gray-400 block mb-1 font-bold">NEW COUPON CODE</label>
                        <input
                          type="text"
                          placeholder="e.g. EXTRA25"
                          value={newCouponCode}
                          onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                          className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-orange-500 uppercase font-black"
                          required
                        />
                      </div>
                      <div className="w-24">
                        <label className="text-[10px] text-gray-400 block mb-1 font-bold">DISCOUNT %</label>
                        <input
                          type="number"
                          placeholder="10"
                          value={newCouponDiscount}
                          onChange={(e) => setNewCouponDiscount(e.target.value)}
                          className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                        />
                      </div>
                      <div className="w-24">
                        <label className="text-[10px] text-gray-400 block mb-1 font-bold">COMMISSION %</label>
                        <input
                          type="number"
                          placeholder="10"
                          value={newCouponComm}
                          onChange={(e) => setNewCouponComm(e.target.value)}
                          className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                        />
                      </div>
                      <div className="w-28">
                        <label className="text-[10px] text-gray-400 block mb-1 font-bold">SCOPE</label>
                        <select
                          value={newCouponScopeType}
                          onChange={(e: any) => setNewCouponScopeType(e.target.value)}
                          className="w-full bg-[#1A1A1A] border border-white/10 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                        >
                          <option value="ALL">All Items</option>
                          <option value="CATEGORY">Category</option>
                          <option value="ITEM">Item</option>
                        </select>
                      </div>
                      <button
                        type="submit"
                        disabled={addingCoupon}
                        className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black rounded-xl text-xs disabled:opacity-50 transition"
                      >
                        {addingCoupon ? 'Adding...' : '+ Add Coupon'}
                      </button>
                    </form>
                  </div>

                  {/* Referred Orders Breakdown Table */}
                  <div className="bg-[#222] p-4 rounded-2xl border border-white/5 space-y-3">
                    <h4 className="text-xs font-black text-orange-400 uppercase tracking-wider">
                      📦 Orders Referred by this Partner ({drilldownData.orders?.length || 0})
                    </h4>

                    {(!drilldownData.orders || drilldownData.orders.length === 0) ? (
                      <p className="text-xs text-gray-500 py-4 text-center">Is partner ke kisi coupon se abhi tak koi order nahi aaya.</p>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {drilldownData.orders.map((ord: any) => {
                          const isDelivered = ord.status === 'DELIVERED';
                          return (
                            <div key={ord.id} className="p-3 bg-[#1A1A1A] rounded-xl border border-white/5 flex flex-wrap items-center justify-between text-xs gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-black text-white">#{ord.orderNumber}</span>
                                  {ord.couponCode && (
                                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold text-[9px]">
                                      🎟️ {ord.couponCode}
                                    </span>
                                  )}
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                    isDelivered ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
                                  }`}>
                                    {ord.status}
                                  </span>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-0.5">
                                  {new Date(ord.createdAt).toLocaleDateString()} • {ord.customerName || ord.address || ord.customerAddress || 'Direct Checkout'}
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="font-black text-white">₹{ord.totalAmount}</span>
                                <span className={`block text-[10px] font-black ${isDelivered ? 'text-green-400' : 'text-gray-500'}`}>
                                  {isDelivered ? `+₹${Math.round((Number(ord.totalAmount) * Number(selectedPartnerProfile.commissionPercent || 10)) / 100)} Comm.` : 'Pending'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                </div>
              ) : null}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
