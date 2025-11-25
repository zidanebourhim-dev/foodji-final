/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */
'use client';
import { useState, useEffect } from 'react';
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, setDoc, addDoc, collection, getDoc } from 'firebase/firestore';

// --- 1. CONFIGURATION FIREBASE (COLLEZ VOS CLÉS ICI) ---
const firebaseConfig = {
 apiKey: "AIzaSyDqXN8tkXCnpXB_QdyHAUX6DzbsiT795FY",
  authDomain: "foodji-app.firebaseapp.com",
  projectId: "foodji-app",
  storageBucket: "foodji-app.firebasestorage.app",
  messagingSenderId: "760216056378",
  appId: "1:760216056378:web:594f079a9ccb031d033b03"
};

// Initialisation sécurisée
let app;
let db: any;
try {
    if (typeof window !== "undefined") {
        app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        db = getFirestore(app);
    }
} catch (error) {
    console.error("Erreur Init Firebase", error);
}

// --- CONFIGURATION APP ---
const PHONE_NUMBER_RESTO = "+212668197671"; 
const PHONE_NUMBER_LIVREUR = "+212668197671"; 

const COLORS = {
  bg: "bg-[#151e32]", 
  bgLight: "bg-[#1f2b45]", 
  accent: "bg-[#a31d24]", 
  textAccent: "text-[#a31d24]", 
};

const UPSELL_ITEMS = [
  { name: "Soda 33cl", price: 12, emoji: "🥤" },
  { name: "Frites", price: 15, emoji: "🍟" }
];

const PROMO_TEXT = "🔥 OFFRE DU MOMENT : Livraison offerte dès 150 DH !";

const SAUCES = ["Algérienne Maison", "Biggy Maison", "BbQ Maison", "Mayonnaise"];
const VIANDES_TACOS = ["Poulet", "Viande hachée", "Nuggets", "Crispy", "Cordon bleu", "Charcuterie"];
const GARNITURES_PIZZA = ["Viande hachée", "Poulet", "Cannibale", "Fruits de mer", "Charcuterie", "4 fromages", "Thon", "Végétarienne", "Pepperoni", "Salami", "Surprenez-moi !"];
const TYPES_PATES = ["Spaghetti", "Penne", "Tagliatelle"];

// --- TYPES ---
type Variation = { size: string; price: number; };
type MenuItem = { name: string; desc: string; image?: string; logic?: string; hasSauce?: boolean; variations: Variation[]; };
type Category = { title: string; items: MenuItem[]; };
type RestoStatus = { isOpen: boolean; closeAt: number | null; openAt: number | null };

// --- MENU ---
const categories: Category[] = [
  {
    title: "🌮 Tacos",
    items: [
      { name: "Tacos Mixte", desc: "Composez votre mélange.", logic: "tacos_mixte", hasSauce: true, variations: [{size: "L", price: 42}, {size: "XL", price: 76}, {size: "XXL", price: 112}] },
      { name: "Tacos Le Taj Mahal", desc: "Viande hachée, Cordon bleu, Nuggets.", hasSauce: true, variations: [{size: "L", price: 34}, {size: "XL", price: 54}, {size: "XXL", price: 96}] },
      { name: "Tacos Crispy", desc: "Poulet pané croustillant.", hasSauce: true, variations: [{size: "L", price: 42}, {size: "XL", price: 76}, {size: "XXL", price: 112}] },
      { name: "Tacos Viande hachée", desc: "", hasSauce: true, variations: [{size: "L", price: 39}, {size: "XL", price: 72}, {size: "XXL", price: 104}] },
      { name: "Tacos Cordon Bleu", desc: "", hasSauce: true, variations: [{size: "L", price: 39}, {size: "XL", price: 72}, {size: "XXL", price: 104}] },
      { name: "Tacos Nuggets", desc: "", hasSauce: true, variations: [{size: "L", price: 39}, {size: "XL", price: 72}, {size: "XXL", price: 104}] },
    ]
  },
  {
    title: "🍕 Pizzas",
    items: [
      { name: "2 Saisons", desc: "2 moitiés au choix.", logic: "pizza_2", variations: [{size: "M", price: 52}, {size: "L", price: 84}] },
      { name: "4 Saisons", desc: "3 à 4 ingrédients au choix.", logic: "pizza_4", variations: [{size: "M", price: 58}, {size: "L", price: 92}] },
      { name: "Pep's", desc: "Sauce tomate, mozzarella, origan.", variations: [{size: "M", price: 28}] },
      { name: "Burrata", desc: "Crémeuse et fraîche.", variations: [{size: "M", price: 78}] },
      { name: "4 Fromages", desc: "Mozza, gorgonzola, chèvre, parmesan.", variations: [{size: "M", price: 52}, {size: "L", price: 84}] },
      { name: "Pepperoni", desc: "", variations: [{size: "M", price: 52}, {size: "L", price: 84}] },
      { name: "Cannibale", desc: "Viande hachée, poulet, merguez.", variations: [{size: "M", price: 56}, {size: "L", price: 87}] },
      { name: "Thon", desc: "", variations: [{size: "M", price: 46}, {size: "L", price: 62}] },
      { name: "Fruits de mer", desc: "", variations: [{size: "M", price: 58}, {size: "L", price: 92}] },
      { name: "Charcuterie", desc: "", variations: [{size: "M", price: 48}, {size: "L", price: 68}] },
      { name: "Végétarienne", desc: "", variations: [{size: "M", price: 46}, {size: "L", price: 62}] },
      { name: "Salami", desc: "", variations: [{size: "M", price: 58}, {size: "L", price: 92}] },
      { name: "Calzone", desc: "", variations: [{size: "M", price: 48}, {size: "L", price: 68}] },
      { name: "Pizza Viande Hachée", desc: "", variations: [{size: "M", price: 52}, {size: "L", price: 84}] },
      { name: "Pizza Poulet", desc: "", variations: [{size: "M", price: 52}, {size: "L", price: 84}] },
    ]
  },
  {
    title: "🍔 Burgers",
    items: [
      { name: "Burger Cheese", desc: "Simple et efficace.", variations: [{size: "Unique", price: 48}] },
      { name: "Burger Double", desc: "Double steak, double plaisir.", variations: [{size: "Unique", price: 69}] },
      { name: "Burger Le Buddha", desc: "Recette signature végétarienne.", variations: [{size: "Unique", price: 50}] },
      { name: "Burger L'Extrême", desc: "Pour les grosses faims.", variations: [{size: "Unique", price: 74}] },
      { name: "Burger Le Foodji", desc: "Le best-seller de la maison.", variations: [{size: "Unique", price: 58}] },
      { name: "Burger Chicken Foodji", desc: "", variations: [{size: "Unique", price: 58}] },
      { name: "Burger Chicken", desc: "", variations: [{size: "Unique", price: 48}] },
      { name: "Burger Le Tasty", desc: "", variations: [{size: "Unique", price: 58}] },
    ]
  },
  {
    title: "🍝 Pâtes",
    items: [
      { name: "Pâtes Bolognaise", desc: "", logic: "pates_choix", variations: [{size: "Unique", price: 58}] },
      { name: "Pâtes Saumon épinard", desc: "", logic: "pates_choix", variations: [{size: "Unique", price: 60}] },
      { name: "Pâtes Poulet Champignon", desc: "", logic: "pates_choix", variations: [{size: "Unique", price: 62}] },
      { name: "Pâtes Arrabiata", desc: "Sauce tomate pimentée.", logic: "pates_choix", variations: [{size: "Unique", price: 42}] },
      { name: "Pâtes Carbonara", desc: "", logic: "pates_choix", variations: [{size: "Unique", price: 52}] },
      { name: "Pâtes 4 fromages", desc: "", logic: "pates_choix", variations: [{size: "Unique", price: 58}] },
      { name: "Pâtes Alfredo", desc: "", logic: "pates_choix", variations: [{size: "Unique", price: 62}] },
      { name: "Pâtes Fruits de Mer", desc: "", logic: "pates_choix", variations: [{size: "Unique", price: 62}] },
      { name: "Pâtes Salami", desc: "", logic: "pates_choix", variations: [{size: "Unique", price: 54}] },
    ]
  },
  {
    title: "🌯 Burritos",
    items: [
      { name: "Burrito Poulet", desc: "Pain tortilla, poulet, riz, maïs, laitue, tomate, cheddar.", variations: [{size: "Unique", price: 42}] },
      { name: "Burrito Viande hachée", desc: "Pain tortilla, viande hachée, riz, cheddar, légumes.", variations: [{size: "Unique", price: 47}] },
      { name: "Burrito Veggie", desc: "Pain tortilla, légumes sautés, riz, laitue, tomate, maïs, cheddar.", variations: [{size: "Unique", price: 39}] },
    ]
  },
  {
    title: "🥙 Koniks",
    items: [
      { name: "Koniks Poulet", desc: "Pain tortilla, poulet, cheddar, mélange de légumes.", variations: [{size: "Unique", price: 48}] },
      { name: "Koniks Viande Hachée", desc: "Pain tortilla, viande hachée, cheddar, légumes.", variations: [{size: "Unique", price: 52}] },
      { name: "L'IKonik", desc: "Pain tortilla, poulet et viande hachée, cheddar, légumes.", variations: [{size: "Unique", price: 58}] },
    ]
  },
  {
    title: "🍟 Sides",
    items: [
      { name: "Ration Frites", desc: "", variations: [{size: "Unique", price: 15}] },
      { name: "Frites Fromagères", desc: "", variations: [{size: "Unique", price: 30}] },
      { name: "Tenders x5", desc: "", variations: [{size: "Unique", price: 35}] },
      { name: "Mozza' Fingers x5", desc: "", variations: [{size: "Unique", price: 25}] },
      { name: "Cheese Bomb x5", desc: "", variations: [{size: "Unique", price: 25}] },
      { name: "Onion rings x5", desc: "", variations: [{size: "Unique", price: 25}] },
      { name: "Frites Carbo", desc: "", variations: [{size: "Unique", price: 45}] },
      { name: "Nuggets x5", desc: "", variations: [{size: "Unique", price: 25}] },
    ]
  }
];

// --- LOGIQUE ---
const getRestaurantStatus = (): RestoStatus => {
    return { isOpen: true, closeAt: 2, openAt: 12 }; // Toujours ouvert pour test
};

const isValidMoroccanPhone = (phone: string) => {
    const cleanPhone = phone.replace(/\s/g, '');
    const regex = /^(05|06|07)\d{8}$/;
    return regex.test(cleanPhone);
};

const generateRandomCode = () => Math.floor(1000 + Math.random() * 9000).toString();
const cleanPhoneForLink = (p: string) => p.replace('+', '');

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('home'); 
  const [activeCategory, setActiveCategory] = useState(categories[0].title);
  const [cart, setCart] = useState<any[]>([]); 
  const [user, setUser] = useState({ name: '', phone: '', address: '', points: 0, comment: '', locationLink: '', pendingPoints: 0, pendingCode: '' });
  const [usePoints, setUsePoints] = useState(false);
  const [orderMethod, setOrderMethod] = useState('livraison'); 
  const [showClosedMessage, setShowClosedMessage] = useState(false);
  const [status, setStatus] = useState<RestoStatus>({ isOpen: true, closeAt: null, openAt: null });
  const [isLocating, setIsLocating] = useState(false);
  const [finalTotal, setFinalTotal] = useState(0);
  
  const [customizingItem, setCustomizingItem] = useState<any>(null); 
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]); 
  
  const [showUpsell, setShowUpsell] = useState(false); 
  const [toast, setToast] = useState<string | null>(null); 
  const [inputCode, setInputCode] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [debugError, setDebugError] = useState("");

  // --- SPLASH SCREEN ---
  useEffect(() => {
    const timer = setTimeout(() => { setLoading(false); }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // --- INIT STATUS ---
  useEffect(() => {
    const checkStatus = () => setStatus(getRestaurantStatus());
    checkStatus();
  }, []);

  // --- CHARGEMENT FIREBASE ---
  useEffect(() => {
    const localData = localStorage.getItem('foodji_account');
    if (localData) {
      const localUser = JSON.parse(localData);
      if (localUser.phone && db) {
         const docRef = doc(db, "clients", localUser.phone);
         getDoc(docRef).then((docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setUser(prev => ({ ...prev, ...localUser, points: data.points, pendingPoints: data.pendingPoints || 0, pendingCode: data.pendingCode || '' }));
            } else setUser(localUser);
         }).catch(e => console.error(e));
      } else setUser(localUser);
    }
  }, []);

  // --- CALCULS DES RÈGLES (Définition déplacée ici pour être visible) ---
  const getConfigRules = () => {
    if (!customizingItem) return { list: [], max: 0, min: 0, title: "" };
    const { item, variation, phase } = customizingItem;
    if (phase === 'sauce' || phase === 'simple_sauce') return { list: SAUCES, max: 2, min: 0, title: "Choisis tes sauces (max 2)" };
    if (item.logic === 'tacos_mixte') {
        let max = 2;
        if (variation.size === 'XL') max = 3;
        if (variation.size === 'XXL') max = 4;
        return { list: VIANDES_TACOS, max, min: 1, title: `Choisis tes ${max} viandes` };
    }
    if (item.logic === 'pizza_2') return { list: GARNITURES_PIZZA, max: 2, min: 2, title: "Choisis tes 2 moitiés" };
    if (item.logic === 'pizza_4') return { list: GARNITURES_PIZZA, max: 4, min: 3, title: "Choisis 3 ou 4 garnitures" };
    if (item.logic === 'pates_choix') return { list: TYPES_PATES, max: 1, min: 1, title: "Choisissez vos pâtes" };
    return { list: [], max: 0, min: 0, title: "" };
  };
  
  const currentRules = customizingItem ? getConfigRules() : { list: [], max: 0, min: 0, title: "" };
  const isConfigValid = selectedOptions.length >= currentRules.min || selectedOptions.includes("Surprenez-moi !");

  // --- HELPER FUNCTIONS ---
  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const getLocation = () => {
    if (!navigator.geolocation) { alert("Géolocalisation non supportée."); return; }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const link = `http://googleusercontent.com/maps.google.com/?q=${position.coords.latitude},${position.coords.longitude}`;
        setUser(prev => ({ ...prev, locationLink: link, address: prev.address || "📍 Position GPS récupérée" }));
        setIsLocating(false);
      },
      (error) => { alert("Impossible de récupérer la position."); setIsLocating(false); }
    );
  };

  const initiateAddToCart = (item: any, variation: any) => {
    if (item.logic) {
      setCustomizingItem({ item, variation, phase: 'logic', previousOptions: [] });
      setSelectedOptions([]);
    } else if (item.hasSauce) {
      setCustomizingItem({ item, variation, phase: 'simple_sauce', previousOptions: [] });
      setSelectedOptions([]);
    } else {
      addToCart(item, variation, []);
    }
  };

  const handleOptionToggle = (option: string, maxLimit: number) => {
    const SURPRISE = "Surprenez-moi !";
    if (option === SURPRISE) {
        setSelectedOptions(selectedOptions.includes(SURPRISE) ? [] : [SURPRISE]);
        return;
    }
    let currentOptions = selectedOptions.includes(SURPRISE) ? [] : [...selectedOptions];
    if (currentOptions.includes(option)) {
        currentOptions = currentOptions.filter(o => o !== option);
    } else {
        if (maxLimit === 1) currentOptions = [option];
        else if (currentOptions.length < maxLimit) currentOptions.push(option);
    }
    setSelectedOptions(currentOptions);
  };

  const handleValidateConfig = () => {
      if (customizingItem.phase === 'logic' && customizingItem.item.hasSauce) {
          setCustomizingItem({ ...customizingItem, phase: 'sauce', previousOptions: selectedOptions });
          setSelectedOptions([]); 
      } else {
          addToCart(customizingItem.item, customizingItem.variation, [...(customizingItem.previousOptions || []), ...selectedOptions]);
      }
  };

  const addToCart = (item: any, variation: any, options: string[] = []) => {
    const cartItem = {
      name: item.name,
      price: variation.price,
      size: variation.size === "Unique" ? "" : variation.size,
      options: options,
      image: item.image,
      id: Math.random()
    };
    setCart([...cart, cartItem]);
    setCustomizingItem(null);
    showToast(`"${item.name}" ajouté au panier !`);
    
    if (item.price > 20) setShowUpsell(true);
  };

  const addUpsellItem = (uItem: any) => {
      setCart(prev => [...prev, { name: uItem.name, price: uItem.price, size: "Unique", options: [], id: Math.random() }]);
      showToast(`+ ${uItem.name} ajouté !`);
      setShowUpsell(false); 
  };

  const removeFromCart = (indexToRemove: number) => {
      setCart(cart.filter((_, index) => index !== indexToRemove));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);
  const deliveryFee = (orderMethod === 'livraison' && cartTotal < 45) ? 5 : 0;
  const discount = usePoints ? Math.min(user.points, cartTotal) : 0;
  const currentFinalPrice = cartTotal + deliveryFee - discount;

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handlePrint = () => { window.print(); };

  // SAUVEGARDE UNIFIÉE (Correction nom)
  const saveUserData = async (updatedUser: any) => {
      localStorage.setItem('foodji_account', JSON.stringify(updatedUser));
      try {
        if(updatedUser.phone && db) {
            const userRef = doc(db, "clients", updatedUser.phone);
            await setDoc(userRef, {
                name: updatedUser.name,
                phone: updatedUser.phone,
                address: updatedUser.address,
                points: updatedUser.points,
                pendingPoints: updatedUser.pendingPoints,
                pendingCode: updatedUser.pendingCode
            }, { merge: true });
        }
      } catch (e: any) {
          console.error("Erreur Firebase Save", e);
          setDebugError("Erreur sauvegarde : " + e.message);
      }
  };

  const sendToResto = async () => {
    if (!status.isOpen) {
        setShowClosedMessage(true);
        return;
    }

    const uniqueCode = generateRandomCode();
    const earnedPoints = parseFloat(((cartTotal - discount) * 0.05).toFixed(1));
    setFinalTotal(currentFinalPrice);
    const pointsAfterUsage = user.points - discount;
    
    const updatedUser = { 
        ...user, 
        points: pointsAfterUsage, 
        pendingPoints: earnedPoints, 
        pendingCode: uniqueCode 
    };
    setUser(updatedUser);
    await saveUserData(updatedUser);

    try {
        if(db) {
            await addDoc(collection(db, "orders"), {
                date: new Date().toISOString(),
                client: updatedUser,
                cart: cart,
                total: currentFinalPrice,
                code: uniqueCode
            });
        }
    } catch (e) { console.error("Erreur Save Order", e); }

    let methodLabel = "🛵 Livraison";
    if (orderMethod === 'emporter') methodLabel = "🛍️ Je passe la récupérer";
    if (orderMethod === 'sur_place') methodLabel = "🍽️ Sur Place";

    let message = `🔐 *CODE FIDÉLITÉ : ${uniqueCode}* 🔐\n\n`;
    message += `*NOUVELLE COMMANDE FOODJI* 🌋\n`;
    message += `---------------------------\n`;
    message += `📌 *Type :* ${methodLabel}\n`;
    message += `👤 *Client :* ${user.name}\n`;
    message += `📞 *Tél :* ${user.phone}\n`;
    if (orderMethod === 'livraison') message += `📍 *Adresse :* ${user.address}\n`;
    if (user.comment) message += `💬 *Note :* ${user.comment}\n`;
    message += `🏆 *Fidélité :* ${pointsAfterUsage} pts (En attente : +${earnedPoints})\n`;
    message += `---------------------------\n`;
    message += `*COMMANDE :*\n`;
    cart.forEach(item => {
      message += `- ${item.name} ${item.size !== "Unique" ? `(${item.size})` : ''} : ${item.price} DH\n`;
      if (item.options && item.options.length > 0) message += `  └ _${item.options.join(', ')}_\n`;
    });
    message += `\n🧾 *DÉTAIL :*`;
    message += `\nPanier : ${cartTotal} DH`;
    if (deliveryFee > 0) message += `\n🛵 Frais de livraison : +${deliveryFee} DH`;
    if (usePoints && discount > 0) message += `\n💎 Points utilisés : -${discount} DH`;
    message += `\n\n💰 *TOTAL À PAYER : ${currentFinalPrice} DH*`;
    
    window.open(`https://wa.me/${cleanPhoneForLink(PHONE_NUMBER_RESTO)}?text=${encodeURIComponent(message)}`, '_blank');
    setView('success');
  };

  const sendToDriver = () => {
    let message = `*📦 COURSE LIVRAISON FOODJI*\n----------------\n`;
    message += `👤 *Client :* ${user.name}\n📞 *Tél :* ${user.phone}\n📍 *Adresse :* ${user.address}\n`;
    if (user.locationLink) message += `🗺️ *GPS :* ${user.locationLink}\n`;
    if (user.comment) message += `💬 *Note :* ${user.comment}\n`;
    message += `---------------------------\n💰 *A ENCAISSER : ${finalTotal} DH*\n`;
    window.open(`https://wa.me/${cleanPhoneForLink(PHONE_NUMBER_LIVREUR)}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const validatePointsCode = async () => {
      if (inputCode.trim() === use