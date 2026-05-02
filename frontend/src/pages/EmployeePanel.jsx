import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  exportData,
  importData,
  resetToDefault,
  applyBulkDiscount,
} from '../utils/storage';
import { importProductsFromCSV } from '../utils/importCSV';
import { importProductsFromExcel } from '../utils/importExcel';
import { getPendingPartners, approvePartner, rejectPartner } from '../utils/customerAuth';
import {
  getBrands,
  addBrand,
  updateBrand,
  deleteBrand,
  toggleBrandEnabled,
  ensureBrandExists,
} from '../utils/brands';
import {
  getTags,
  addTag,
  updateTag,
  deleteTag,
  toggleTagEnabled,
  ensureTagExists,
} from '../utils/tags';
import { getSiteSettings, setSalesMode, setLandingTags } from '../utils/siteSettings';
import { getCurrentEmployee, logoutEmployee, hasPermission } from '../utils/employeeAuth';
import { PERMISSIONS, PERMISSIONS_LIST } from '../utils/permissions';
import CreateQuotePage from './CreateQuotePage';
import QuotesListPage from './QuotesListPage';
import '../pages/AdminPage.css';

const EmployeePanel = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [discountOnly, setDiscountOnly] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');

  const [ioFormat, setIoFormat] = useState('json');
  const [selectedFile, setSelectedFile] = useState(null);

  const [form, setForm] = useState({
    productCode: '',
    grade: '',
    name: '',
    price: '',
    partnerPrice: '',
    discount: '',
    stock: '',
    description: '',
    manufacturer: '',
    glazeType: '',
    glaze: '',
    suitableFor: '',
    category: '',
    size: '',
    color: '',
    images: '',
    fullDescription: '',
    tags: [],
    audience: 'all',
  });

  const imagePreview = form.images ? form.images.split(',').map(s => s.trim()).filter(Boolean) : [];

  const navigate = useNavigate();
  const categorySelectRef = useRef(null);

  const [duplicateModal, setDuplicateModal] = useState({
    isOpen: false,
    productName: '',
    onResolve: null,
  });

  const [pendingPartners, setPendingPartners] = useState([]);
  const [brands, setBrands] = useState([]);
  const [editingBrand, setEditingBrand] = useState(null);
  const [brandForm, setBrandForm] = useState('');
  const [tags, setTags] = useState([]);
  const [editingTag, setEditingTag] = useState(null);
  const [tagForm, setTagForm] = useState('');
  const [siteSettings, setSiteSettings] = useState({ salesMode: 'cart' });
  const [tempSalesMode, setTempSalesMode] = useState('cart');
  const [landingTags, setLandingTagsState] = useState(['فروش ویژه', 'جدید', 'پرفروش']);
  const [availableTagsForSelect, setAvailableTagsForSelect] = useState([]);

  const [bulkDiscountBar, setBulkDiscountBar] = useState({
    isOpen: false,
    discountType: 'percent',
    discountValue: '',
  });

  const employee = getCurrentEmployee();

  useEffect(() => {
    refreshProducts();
  }, []);

  useEffect(() => {
    if (activeMenu === 'partners') loadPendingPartners();
    if (activeMenu === 'brands') {
      const loadBrands = async () => {
        const brandsData = await getBrands();
        setBrands(Array.isArray(brandsData) ? brandsData : []);
      };
      loadBrands();
    }
    if (activeMenu === 'tags') {
      const loadTags = async () => {
        const tagsData = await getTags();
        setTags(Array.isArray(tagsData) ? tagsData : []);
      };
      loadTags();
    }
    if (activeMenu === 'settings') {
      getSiteSettings().then(s => {
        setSiteSettings(s);
        setTempSalesMode(s.salesMode);
        setLandingTagsState(s.landingTags || ['فروش ویژه', 'جدید', 'پرفروش']);
      });
      const loadTagsForSelect = async () => {
        const tagsData = await getTags();
        setAvailableTagsForSelect(tagsData.map(t => t.name));
      };
      loadTagsForSelect();
    }
  }, [activeMenu]);

  const refreshProducts = async () => {
    const prods = await getProducts();
    setProducts(prods);
  };

  const loadPendingPartners = () => setPendingPartners(getPendingPartners());

  const stats = useMemo(() => {
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
    const discounted = products.filter(p => p.discount > 0).length;
    return { total: products.length, categories: categories.length, discounted };
  }, [products]);

  const allCategories = useMemo(() => [...new Set(products.map(p => p.category).filter(Boolean))], [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = searchTerm
        ? p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.category && p.category.includes(searchTerm))
        : true;
      const matchesCategory = filterCategory ? p.category === filterCategory : true;
      const matchesDiscount = discountOnly ? p.discount > 0 : true;
      return matchesSearch && matchesCategory && matchesDiscount;
    });
  }, [products, searchTerm, filterCategory, discountOnly]);

  const handleTotalProductsClick = () => {
    if (!hasPermission(PERMISSIONS.VIEW_PRODUCTS)) return;
    setDiscountOnly(false);
    setFilterCategory('');
    setSearchTerm('');
    setActiveMenu('products');
  };

  const handleCategoriesClick = () => {
    if (!hasPermission(PERMISSIONS.VIEW_PRODUCTS)) return;
    setDiscountOnly(false);
    setFilterCategory('');
    setSearchTerm('');
    setActiveMenu('products');
    setTimeout(() => {
      if (categorySelectRef.current) {
        categorySelectRef.current.focus();
        categorySelectRef.current.click();
      }
    }, 100);
  };

  const handleDiscountedClick = () => {
    if (!hasPermission(PERMISSIONS.VIEW_PRODUCTS)) return;
    setDiscountOnly(true);
    setFilterCategory('');
    setSearchTerm('');
    setActiveMenu('products');
  };

  const handleTagToggle = (tag) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasPermission(PERMISSIONS.ADD_PRODUCT) && !editingId) {
      alert('شما دسترسی افزودن محصول ندارید.');
      return;
    }
    if (editingId && !hasPermission(PERMISSIONS.EDIT_PRODUCT)) {
      alert('شما دسترسی ویرایش محصول ندارید.');
      return;
    }

    if (!form.productCode || form.productCode.trim() === '') {
      alert('کد محصول الزامی است');
      return;
    }
    if (form.name.trim() === '' || form.price === '') {
      alert('نام و قیمت الزامی هستند');
      return;
    }

    const imageArray = form.images ? form.images.split(',').map(s => s.trim()).filter(Boolean) : [];
    const productData = {
      ...form,
      price: Number(form.price) || 0,
      partnerPrice: form.partnerPrice ? Number(form.partnerPrice) : Number(form.price) || 0,
      discount: Number(form.discount) || 0,
      stock: Number(form.stock) || 0,
      images: imageArray,
      tags: form.tags,
    };

    const existingProduct = products.find(p => p.productCode === form.productCode.trim());
    if (existingProduct && !editingId) {
      const shouldUpdate = window.confirm(
        `محصولی با کد "${form.productCode}" از قبل وجود دارد (${existingProduct.name}).\n` +
          `قیمت و موجودی آن با مقادیر جدید به‌روز شود؟`
      );
      if (shouldUpdate) {
        await updateProduct(existingProduct.id, {
          price: productData.price,
          partnerPrice: productData.partnerPrice,
          stock: productData.stock,
        });
        await refreshProducts();
      }
      closeForm();
      return;
    }

    if (form.manufacturer) {
      ensureBrandExists(form.manufacturer);
      if (activeMenu === 'brands') setBrands(getBrands());
    }
    form.tags.forEach(tag => ensureTagExists(tag));
    if (activeMenu === 'tags') setTags(getTags());

    if (editingId) {
      await updateProduct(editingId, productData);
    } else {
      await addProduct(productData);
    }

    await refreshProducts();
    closeForm();
  };

  const closeForm = () => {
    setForm({
      productCode: '',
      grade: '',
      name: '',
      price: '',
      partnerPrice: '',
      discount: '',
      stock: '',
      description: '',
      manufacturer: '',
      glazeType: '',
      glaze: '',
      suitableFor: '',
      category: '',
      size: '',
      color: '',
      images: '',
      fullDescription: '',
      tags: [],
      audience: 'all',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (product) => {
    if (!hasPermission(PERMISSIONS.EDIT_PRODUCT)) {
      alert('شما دسترسی ویرایش محصول ندارید.');
      return;
    }
    setEditingId(product.id);
    setForm({
      productCode: product.productCode || '',
      grade: product.grade || '',
      name: product.name || '',
      price: product.price || '',
      partnerPrice: product.partnerPrice !== undefined ? product.partnerPrice : product.price || '',
      discount: product.discount || '',
      stock: product.stock || '',
      description: product.description || '',
      manufacturer: product.manufacturer || '',
      glazeType: product.glazeType || '',
      glaze: product.glaze || '',
      suitableFor: product.suitableFor || '',
      category: product.category || '',
      size: product.size || '',
      color: product.color || '',
      images: product.images ? product.images.join(', ') : '',
      fullDescription: product.fullDescription || '',
      tags: product.tags || [],
      audience: product.audience || 'all',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!hasPermission(PERMISSIONS.DELETE_PRODUCT)) {
      alert('شما دسترسی حذف محصول ندارید.');
      return;
    }
    if (window.confirm('آیا از حذف این محصول اطمینان دارید؟')) {
      await deleteProduct(id);
      await refreshProducts();
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    }
  };

  const handleBulkDelete = async () => {
    if (!hasPermission(PERMISSIONS.DELETE_PRODUCT)) {
      alert('شما دسترسی حذف گروهی ندارید.');
      return;
    }
    if (selectedIds.length === 0) return;
    if (window.confirm(`${selectedIds.length} محصول حذف شوند؟`)) {
      for (const id of selectedIds) {
        await deleteProduct(id);
      }
      await refreshProducts();
      setSelectedIds([]);
    }
  };

  const toggleSelect = (id) => {
    if (!hasPermission(PERMISSIONS.DELETE_PRODUCT) && !hasPermission(PERMISSIONS.BULK_DISCOUNT)) return;
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    if (!hasPermission(PERMISSIONS.DELETE_PRODUCT) && !hasPermission(PERMISSIONS.BULK_DISCOUNT)) return;
    if (selectedIds.length === filteredProducts.length && filteredProducts.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map(p => p.id));
    }
  };

  const handleLogout = () => {
    logoutEmployee();
    navigate('/login');
  };

  const handleReset = async () => {
    if (!hasPermission(PERMISSIONS.RESET_DATA)) {
      alert('شما دسترسی بازنشانی داده‌ها را ندارید.');
      return;
    }
    if (window.confirm('آیا از بازنشانی به داده‌های پیش‌فرض اطمینان دارید؟')) {
      await resetToDefault();
      await refreshProducts();
      alert('داده‌ها به حالت اولیه بازگشتند.');
      setFilterCategory('');
      setSearchTerm('');
      setDiscountOnly(false);
    }
  };

  const handleFileSelect = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const showDuplicateDialog = (productName) => {
    return new Promise(resolve => {
      setDuplicateModal({
        isOpen: true,
        productName,
        onResolve: choice => {
          setDuplicateModal({ isOpen: false, productName: '', onResolve: null });
          resolve(choice);
        },
      });
    });
  };

  const handleImport = async () => {
    if (!hasPermission(PERMISSIONS.IMPORT_EXPORT)) {
      alert('شما دسترسی وارد کردن داده را ندارید.');
      return;
    }
    if (!selectedFile) {
      alert('لطفاً یک فایل انتخاب کنید.');
      return;
    }
    if (ioFormat === 'excel' && !window.XLSX) {
      alert('کتابخانه Excel بارگذاری نشده است.');
      return;
    }
    try {
      let importedProducts = [];
      if (ioFormat === 'json') {
        const text = await selectedFile.text();
        const result = await importData(text);
        if (result.success) {
          importedProducts = JSON.parse(text);
        } else {
          throw new Error(result.error);
        }
      } else if (ioFormat === 'csv') {
        importedProducts = await importProductsFromCSV(selectedFile);
      } else if (ioFormat === 'excel') {
        importedProducts = await importProductsFromExcel(selectedFile);
      }
      if (importedProducts.length === 0) {
        alert('هیچ محصول معتبری در فایل یافت نشد.');
        return;
      }
      importedProducts.forEach(p => {
        if (p.manufacturer) ensureBrandExists(p.manufacturer);
        if (p.tags) p.tags.forEach(tag => ensureTagExists(tag));
      });
      if (activeMenu === 'brands') setBrands(getBrands());
      if (activeMenu === 'tags') setTags(getTags());

      const existingProducts = await getProducts();
      const existingCodes = new Map();
      existingProducts.forEach(p => {
        if (p.productCode) existingCodes.set(p.productCode, p);
      });

      const toAdd = [];
      const toUpdate = [];
      let updateAll = false;
      let skipAll = false;

      for (const imported of importedProducts) {
        const importedCode = (imported.productCode || '').trim();
        if (!importedCode) continue;
        const existing = existingCodes.get(importedCode);
        if (!existing) {
          toAdd.push(imported);
          continue;
        }
        if (updateAll) {
          toUpdate.push({ existing, imported });
        } else if (skipAll) {
          continue;
        } else {
          const choice = await showDuplicateDialog(importedCode);
          switch (choice) {
            case 'update':
              toUpdate.push({ existing, imported });
              break;
            case 'updateAll':
              updateAll = true;
              toUpdate.push({ existing, imported });
              break;
            case 'skip':
              break;
            case 'skipAll':
              skipAll = true;
              break;
            default:
              throw new Error('عملیات توسط کاربر لغو شد.');
          }
        }
      }

      let addedCount = 0,
        updatedCount = 0;
      for (const p of toAdd) {
        await addProduct(p);
        addedCount++;
      }
      for (const { existing, imported } of toUpdate) {
        await updateProduct(existing.id, {
          price: imported.price || existing.price,
          partnerPrice: imported.partnerPrice !== undefined ? imported.partnerPrice : existing.partnerPrice,
          stock: imported.stock !== undefined ? imported.stock : existing.stock,
        });
        updatedCount++;
      }

      await refreshProducts();
      alert(`✅ ${addedCount} محصول جدید اضافه شد، ${updatedCount} محصول به‌روزرسانی شد.`);
    } catch (error) {
      if (error.message !== 'عملیات توسط کاربر لغو شد.') {
        alert('خطا در وارد کردن فایل: ' + error.message);
      }
    } finally {
      setSelectedFile(null);
      document.getElementById('file-input').value = '';
    }
  };

  const handleExport = async () => {
    if (!hasPermission(PERMISSIONS.IMPORT_EXPORT)) {
      alert('شما دسترسی خروجی گرفتن داده را ندارید.');
      return;
    }
    const data = await exportData();
    const productsArray = JSON.parse(data);
    let blob, filename;
    if (ioFormat === 'json') {
      blob = new Blob([data], { type: 'application/json' });
      filename = `products_backup_${new Date().toISOString().slice(0, 10)}.json`;
    } else if (ioFormat === 'csv') {
      const headers = [
        'کد محصول',
        'درجه',
        'نام',
        'قیمت',
        'قیمت همکار',
        'تخفیف',
        'موجودی',
        'دسته‌بندی',
        'شرکت سازنده',
        'نوع خاک',
        'نوع لعاب',
        'مناسب برای',
        'سایز',
        'رنگ',
        'تصاویر',
        'توضیحات',
        'توضیحات کامل',
        'تگ‌ها',
        'مخاطب',
      ];
      const rows = productsArray.map(p => [
        p.productCode || '',
        p.grade || '',
        p.name,
        p.price,
        p.partnerPrice,
        p.discount,
        p.stock,
        p.category || '',
        p.manufacturer || '',
        p.glazeType || '',
        p.glaze || '',
        p.suitableFor || '',
        p.size || '',
        p.color || '',
        (p.images || []).join(';'),
        p.description || '',
        p.fullDescription || '',
        (p.tags || []).join(';'),
        p.audience || 'all',
      ]);
      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');
      blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      filename = `products_export_${new Date().toISOString().slice(0, 10)}.csv`;
    } else if (ioFormat === 'excel') {
      if (!window.XLSX) {
        alert('کتابخانه Excel بارگذاری نشده است.');
        return;
      }
      const headers = [
        'کد محصول',
        'درجه',
        'نام',
        'قیمت',
        'قیمت همکار',
        'تخفیف',
        'موجودی',
        'دسته‌بندی',
        'شرکت سازنده',
        'نوع خاک',
        'نوع لعاب',
        'مناسب برای',
        'سایز',
        'رنگ',
        'تصاویر',
        'توضیحات',
        'توضیحات کامل',
        'تگ‌ها',
        'مخاطب',
      ];
      const rows = productsArray.map(p => [
        p.productCode || '',
        p.grade || '',
        p.name,
        p.price,
        p.partnerPrice,
        p.discount,
        p.stock,
        p.category || '',
        p.manufacturer || '',
        p.glazeType || '',
        p.glaze || '',
        p.suitableFor || '',
        p.size || '',
        p.color || '',
        (p.images || []).join(';'),
        p.description || '',
        p.fullDescription || '',
        (p.tags || []).join(';'),
        p.audience || 'all',
      ]);
      const wb = window.XLSX.utils.book_new();
      const ws = window.XLSX.utils.aoa_to_sheet([headers, ...rows]);
      window.XLSX.utils.book_append_sheet(wb, ws, 'محصولات');
      window.XLSX.writeFile(wb, `products_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
      return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadTemplate = () => {
    if (!hasPermission(PERMISSIONS.IMPORT_EXPORT)) {
      alert('شما دسترسی دانلود قالب را ندارید.');
      return;
    }
    if (ioFormat === 'json') {
      const template = [
        {
          productCode: 'PRD-001',
          grade: 'A',
          name: 'کاشی نمونه',
          price: 100000,
          partnerPrice: 85000,
          discount: 0,
          stock: 100,
          category: 'کف',
          manufacturer: 'حافظ',
          glazeType: 'خاک سفید',
          glaze: 'براق',
          suitableFor: 'سالن',
          size: '60*60',
          color: 'سفید',
          images: ['/images/sample1.jpg', '/images/sample2.jpg'],
          description: 'توضیح کوتاه',
          fullDescription: '<p>توضیح بلند</p>',
          tags: ['جدید', 'پرفروش'],
          audience: 'all',
        },
      ];
      const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'template.json';
      a.click();
      URL.revokeObjectURL(url);
    } else if (ioFormat === 'csv') {
      const headers = [
        'کد محصول',
        'درجه',
        'نام',
        'قیمت',
        'قیمت همکار',
        'تخفیف',
        'موجودی',
        'دسته‌بندی',
        'شرکت سازنده',
        'نوع خاک',
        'نوع لعاب',
        'مناسب برای',
        'سایز',
        'رنگ',
        'تصاویر',
        'توضیحات',
        'توضیحات کامل',
        'تگ‌ها',
        'مخاطب',
      ];
      const sampleRow = [
        'PRD-001',
        'A',
        'کاشی نمونه',
        '100000',
        '85000',
        '0',
        '100',
        'کف',
        'حافظ',
        'خاک سفید',
        'براق',
        'سالن',
        '60*60',
        'سفید',
        '/images/sample1.jpg;/images/sample2.jpg',
        'توضیح کوتاه',
        '<p>توضیح بلند</p>',
        'جدید;پرفروش',
        'all',
      ];
      const csvContent = headers.join(',') + '\n' + sampleRow.join(',');
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'template.csv';
      a.click();
      URL.revokeObjectURL(url);
    } else if (ioFormat === 'excel') {
      if (!window.XLSX) {
        alert('کتابخانه Excel بارگذاری نشده است.');
        return;
      }
      const headers = [
        'کد محصول',
        'درجه',
        'نام',
        'قیمت',
        'قیمت همکار',
        'تخفیف',
        'موجودی',
        'دسته‌بندی',
        'شرکت سازنده',
        'نوع خاک',
        'نوع لعاب',
        'مناسب برای',
        'سایز',
        'رنگ',
        'تصاویر',
        'توضیحات',
        'توضیحات کامل',
        'تگ‌ها',
        'مخاطب',
      ];
      const sampleRow = [
        'PRD-001',
        'A',
        'کاشی نمونه',
        '100000',
        '85000',
        '0',
        '100',
        'کف',
        'حافظ',
        'خاک سفید',
        'براق',
        'سالن',
        '60*60',
        'سفید',
        '/images/sample1.jpg;/images/sample2.jpg',
        'توضیح کوتاه',
        '<p>توضیح بلند</p>',
        'جدید;پرفروش',
        'all',
      ];
      const wb = window.XLSX.utils.book_new();
      const ws = window.XLSX.utils.aoa_to_sheet([headers, sampleRow]);
      window.XLSX.utils.book_append_sheet(wb, ws, 'محصولات');
      window.XLSX.writeFile(wb, 'template.xlsx');
    }
  };

  // مدیریت برندها
  const handleAddBrand = () => {
    if (!hasPermission(PERMISSIONS.MANAGE_BRANDS)) {
      alert('شما دسترسی مدیریت برندها را ندارید.');
      return;
    }
    const result = addBrand(brandForm);
    if (result.success) {
      setBrands(result.brands);
      setBrandForm('');
    } else {
      alert(result.error);
    }
  };

  const handleUpdateBrand = () => {
    if (!hasPermission(PERMISSIONS.MANAGE_BRANDS)) return;
    if (!editingBrand) return;
    const result = updateBrand(editingBrand, brandForm);
    if (result.success) {
      setBrands(result.brands);
      setBrandForm('');
      setEditingBrand(null);
    } else {
      alert(result.error);
    }
  };

  const handleDeleteBrand = (name) => {
    if (!hasPermission(PERMISSIONS.MANAGE_BRANDS)) return;
    if (window.confirm(`برند "${name}" حذف شود؟`)) {
      const result = deleteBrand(name);
      setBrands(result.brands);
    }
  };

  const handleToggleBrand = (brandName, enabled) => {
    if (!hasPermission(PERMISSIONS.MANAGE_BRANDS)) return;
    const result = toggleBrandEnabled(brandName, enabled);
    if (result.success) setBrands(result.brands);
  };

  const startEditBrand = (name) => {
    if (!hasPermission(PERMISSIONS.MANAGE_BRANDS)) return;
    setEditingBrand(name);
    setBrandForm(name);
  };

  const cancelEditBrand = () => {
    setEditingBrand(null);
    setBrandForm('');
  };

  // مدیریت تگ‌ها
  const handleAddTag = () => {
    if (!hasPermission(PERMISSIONS.MANAGE_TAGS)) {
      alert('شما دسترسی مدیریت تگ‌ها را ندارید.');
      return;
    }
    const result = addTag(tagForm);
    if (result.success) {
      setTags(result.tags);
      setTagForm('');
    } else {
      alert(result.error);
    }
  };

  const handleUpdateTag = () => {
    if (!hasPermission(PERMISSIONS.MANAGE_TAGS)) return;
    if (!editingTag) return;
    const result = updateTag(editingTag, tagForm);
    if (result.success) {
      setTags(result.tags);
      setTagForm('');
      setEditingTag(null);
    } else {
      alert(result.error);
    }
  };

  const handleDeleteTag = (name) => {
    if (!hasPermission(PERMISSIONS.MANAGE_TAGS)) return;
    if (window.confirm(`تگ "${name}" حذف شود؟`)) {
      const result = deleteTag(name);
      setTags(result.tags);
    }
  };

  const handleToggleTag = (tagName, enabled) => {
    if (!hasPermission(PERMISSIONS.MANAGE_TAGS)) return;
    const result = toggleTagEnabled(tagName, enabled);
    if (result.success) setTags(result.tags);
  };

  const startEditTag = (name) => {
    if (!hasPermission(PERMISSIONS.MANAGE_TAGS)) return;
    setEditingTag(name);
    setTagForm(name);
  };

  const cancelEditTag = () => {
    setEditingTag(null);
    setTagForm('');
  };

  const handleApprovePartner = (id) => {
    if (!hasPermission(PERMISSIONS.MANAGE_PARTNERS)) {
      alert('شما دسترسی مدیریت همکاران را ندارید.');
      return;
    }
    if (window.confirm('تأیید این همکار؟')) {
      approvePartner(id);
      loadPendingPartners();
    }
  };

  const handleRejectPartner = (id) => {
    if (!hasPermission(PERMISSIONS.MANAGE_PARTNERS)) {
      alert('شما دسترسی مدیریت همکاران را ندارید.');
      return;
    }
    if (window.confirm('رد درخواست و حذف این کاربر؟')) {
      rejectPartner(id);
      loadPendingPartners();
    }
  };

  const handleTempSalesModeChange = (e) => {
    if (!hasPermission(PERMISSIONS.EDIT_SALES_MODE)) return;
    setTempSalesMode(e.target.value);
  };

  const handleSaveSettings = async () => {
    if (!hasPermission(PERMISSIONS.EDIT_SALES_MODE)) {
      alert('شما دسترسی تغییر تنظیمات را ندارید.');
      return;
    }
    const success = await setSalesMode(tempSalesMode);
    if (success) {
      setSiteSettings({ salesMode: tempSalesMode });
      alert('تنظیمات با موفقیت ذخیره شد.');
    } else {
      alert('خطا در ذخیره تنظیمات.');
    }
  };

  const handleSaveLandingTags = async () => {
    if (!hasPermission(PERMISSIONS.EDIT_LANDING_TAGS)) {
      alert('شما دسترسی تغییر تگ‌های صفحه اصلی را ندارید.');
      return;
    }
    const success = await setLandingTags(landingTags);
    if (success) {
      alert('تگ‌های صفحه اصلی با موفقیت ذخیره شد.');
    } else {
      alert('خطا در ذخیره تگ‌ها.');
    }
  };

  // تخفیف گروهی
  const openBulkDiscountBar = () => {
    if (!hasPermission(PERMISSIONS.BULK_DISCOUNT)) {
      alert('شما دسترسی تخفیف گروهی ندارید.');
      return;
    }
    if (selectedIds.length === 0) {
      alert('هیچ محصولی انتخاب نشده است.');
      return;
    }
    setBulkDiscountBar({ isOpen: true, discountType: 'percent', discountValue: '' });
  };

  const closeBulkDiscountBar = () => {
    setBulkDiscountBar({ isOpen: false, discountType: 'percent', discountValue: '' });
  };

  const handleApplyBulkDiscount = async () => {
    if (!hasPermission(PERMISSIONS.BULK_DISCOUNT)) {
      alert('شما دسترسی تخفیف گروهی ندارید.');
      return;
    }
    const value = Number(bulkDiscountBar.discountValue);
    if (isNaN(value) || value <= 0) {
      alert('مقدار تخفیف باید عددی مثبت باشد.');
      return;
    }
    if (bulkDiscountBar.discountType === 'percent' && value > 100) {
      alert('درصد تخفیف نمی‌تواند بیش از ۱۰۰ باشد.');
      return;
    }
    await applyBulkDiscount(selectedIds, bulkDiscountBar.discountType, value);
    await refreshProducts();
    setSelectedIds([]);
    closeBulkDiscountBar();
    alert('تخفیف گروهی با موفقیت اعمال شد.');
  };

  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) return product.images[0];
    if (product.image) return product.image;
    return 'https://picsum.photos/50/50?random=' + product.id;
  };

  const menuItems = [
    { key: 'dashboard', label: '📊 داشبورد', perm: PERMISSIONS.VIEW_DASHBOARD },
    { key: 'products', label: '🧱 همه محصولات', perm: PERMISSIONS.VIEW_PRODUCTS },
    { key: 'brands', label: '🏷️ مدیریت برندها', perm: PERMISSIONS.MANAGE_BRANDS },
    { key: 'tags', label: '🔖 مدیریت تگ‌ها', perm: PERMISSIONS.MANAGE_TAGS },
    { key: 'partners', label: '🤝 درخواست‌های همکاری', perm: PERMISSIONS.MANAGE_PARTNERS },
    { key: 'create-quote', label: '📄 ایجاد پیش‌فاکتور', perm: PERMISSIONS.CREATE_QUOTE },
    { key: 'quotes', label: '📋 لیست پیش‌فاکتورها', perm: PERMISSIONS.VIEW_QUOTES },
    { key: 'data', label: '📤 ورود و خروج داده', perm: PERMISSIONS.IMPORT_EXPORT },
    { key: 'settings', label: '⚙️ تنظیمات', perm: PERMISSIONS.EDIT_SALES_MODE },
  ].filter(item => hasPermission(item.perm));

  const currentMenuTitle = menuItems.find(m => m.key === activeMenu)?.label || 'پنل کارمند';

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>پنل کارمند</h2>
          <p>{employee?.name}</p>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <button
              key={item.key}
              className={activeMenu === item.key ? 'active' : ''}
              onClick={() => setActiveMenu(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            🚪 خروج
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="main-header-bar">
          <h1>{currentMenuTitle}</h1>
          <div className="header-actions">
            <span>👤 کارمند: {employee?.name}</span>
          </div>
        </header>

        <div className="main-content">
          {/* داشبورد */}
          {activeMenu === 'dashboard' && (
            <div className="dashboard-view">
              <div className="stats-grid">
                <div className="stat-card clickable" onClick={handleTotalProductsClick}>
                  <span className="stat-value">{stats.total}</span>
                  <span>کل محصولات</span>
                </div>
                <div className="stat-card clickable" onClick={handleCategoriesClick}>
                  <span className="stat-value">{stats.categories}</span>
                  <span>دسته‌بندی‌ها</span>
                </div>
                <div className="stat-card clickable" onClick={handleDiscountedClick}>
                  <span className="stat-value">{stats.discounted}</span>
                  <span>تخفیف‌دار</span>
                </div>
              </div>
            </div>
          )}

          {/* محصولات */}
          {activeMenu === 'products' && (
            <>
              <div className="action-bar">
                {hasPermission(PERMISSIONS.ADD_PRODUCT) && (
                  <button className="btn-primary" onClick={() => setShowForm(true)}>
                    ➕ افزودن محصول
                  </button>
                )}
                <div className="action-bar-right">
                  <select
                    ref={categorySelectRef}
                    value={filterCategory}
                    onChange={e => setFilterCategory(e.target.value)}
                    className="category-filter-select"
                  >
                    <option value="">همه دسته‌ها</option>
                    {allCategories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>

                  {(hasPermission(PERMISSIONS.BULK_DISCOUNT) || hasPermission(PERMISSIONS.DELETE_PRODUCT)) &&
                    selectedIds.length > 0 && (
                      <>
                        {hasPermission(PERMISSIONS.BULK_DISCOUNT) && (
                          <button className="icon-btn" onClick={openBulkDiscountBar} title="تخفیف گروهی">
                            🏷️
                          </button>
                        )}
                        {hasPermission(PERMISSIONS.DELETE_PRODUCT) && (
                          <button className="icon-btn delete-icon" onClick={handleBulkDelete} title="حذف">
                            🗑️
                          </button>
                        )}
                      </>
                    )}

                  <div className="search-wrapper">
                    <input
                      type="text"
                      placeholder="جستجو..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="search-input"
                    />
                    <button className="search-btn" aria-label="جستجو">
                      🔍
                    </button>
                  </div>
                </div>
              </div>

              {bulkDiscountBar.isOpen && hasPermission(PERMISSIONS.BULK_DISCOUNT) && (
                <div className="bulk-discount-bar">
                  <span className="selected-count">{selectedIds.length} محصول انتخاب شده</span>
                  <div className="discount-type-selector">
                    <label>
                      <input
                        type="radio"
                        value="percent"
                        checked={bulkDiscountBar.discountType === 'percent'}
                        onChange={() => setBulkDiscountBar({ ...bulkDiscountBar, discountType: 'percent' })}
                      />
                      تخفیف درصدی
                    </label>
                    <label>
                      <input
                        type="radio"
                        value="amount"
                        checked={bulkDiscountBar.discountType === 'amount'}
                        onChange={() => setBulkDiscountBar({ ...bulkDiscountBar, discountType: 'amount' })}
                      />
                      تخفیف مبلغی (تومان)
                    </label>
                  </div>
                  <div className="discount-value-input">
                    <input
                      type="number"
                      placeholder={bulkDiscountBar.discountType === 'percent' ? 'درصد تخفیف' : 'مبلغ تخفیف (تومان)'}
                      value={bulkDiscountBar.discountValue}
                      onChange={e => setBulkDiscountBar({ ...bulkDiscountBar, discountValue: e.target.value })}
                      min="0"
                      step={bulkDiscountBar.discountType === 'percent' ? '1' : '1000'}
                    />
                  </div>
                  <div className="bar-actions">
                    <button className="btn-primary" onClick={handleApplyBulkDiscount}>
                      اعمال
                    </button>
                    <button className="btn-secondary" onClick={closeBulkDiscountBar}>
                      انصراف
                    </button>
                  </div>
                </div>
              )}

              {showForm && (hasPermission(PERMISSIONS.ADD_PRODUCT) || hasPermission(PERMISSIONS.EDIT_PRODUCT)) && (
                <div className="form-modal">
                  <div className="modal-content">
                    <h3>{editingId ? 'ویرایش محصول' : 'افزودن محصول جدید'}</h3>
                    <form onSubmit={handleSubmit}>
                      <div className="form-row">
                        <input
                          placeholder="کد محصول *"
                          value={form.productCode}
                          onChange={e => setForm({ ...form, productCode: e.target.value })}
                          required
                        />
                        <input
                          placeholder="درجه (مثلاً A, B, C)"
                          value={form.grade}
                          onChange={e => setForm({ ...form, grade: e.target.value })}
                        />
                      </div>
                      <div className="form-row">
                        <input
                          placeholder="نام *"
                          value={form.name}
                          onChange={e => setForm({ ...form, name: e.target.value })}
                          required
                        />
                        <input
                          placeholder="قیمت پایه *"
                          type="number"
                          value={form.price}
                          onChange={e => setForm({ ...form, price: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-row">
                        <input
                          placeholder="قیمت همکار (اختیاری)"
                          type="number"
                          value={form.partnerPrice}
                          onChange={e => setForm({ ...form, partnerPrice: e.target.value })}
                        />
                        <input
                          placeholder="تخفیف %"
                          type="number"
                          value={form.discount}
                          onChange={e => setForm({ ...form, discount: e.target.value })}
                        />
                      </div>
                      <div className="form-row">
                        <input
                          placeholder="متراژ موجودی"
                          type="number"
                          value={form.stock}
                          onChange={e => setForm({ ...form, stock: e.target.value })}
                        />
                      </div>
                      <div className="form-row">
                        <input
                          placeholder="دسته‌بندی"
                          value={form.category}
                          onChange={e => setForm({ ...form, category: e.target.value })}
                        />
                        <select
                          value={form.manufacturer}
                          onChange={e => setForm({ ...form, manufacturer: e.target.value })}
                        >
                          <option value="">انتخاب شرکت</option>
                          {brands.map(brand => (
                            <option key={brand.name} value={brand.name}>
                              {brand.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-row">
                        <select
                          value={form.glazeType}
                          onChange={e => setForm({ ...form, glazeType: e.target.value })}
                        >
                          <option value="">نوع خاک</option>
                          <option value="خاک سفید">خاک سفید</option>
                          <option value="خاک قرمز">خاک قرمز</option>
                          <option value="پرسلان">پرسلان</option>
                        </select>
                        <input
                          placeholder="نوع لعاب"
                          value={form.glaze}
                          onChange={e => setForm({ ...form, glaze: e.target.value })}
                        />
                      </div>
                      <div className="form-row">
                        <input
                          placeholder="سایز"
                          value={form.size}
                          onChange={e => setForm({ ...form, size: e.target.value })}
                        />
                        <input
                          placeholder="رنگ"
                          value={form.color}
                          onChange={e => setForm({ ...form, color: e.target.value })}
                        />
                      </div>
                      <div className="form-row">
                        <input
                          placeholder="مناسب برای"
                          value={form.suitableFor}
                          onChange={e => setForm({ ...form, suitableFor: e.target.value })}
                        />
                      </div>
                      <textarea
                        placeholder="توضیحات کوتاه"
                        value={form.description}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                      />
                      <input
                        placeholder="آدرس تصاویر (با کاما جدا کنید)"
                        value={form.images}
                        onChange={e => setForm({ ...form, images: e.target.value })}
                      />
                      {imagePreview.length > 0 && (
                        <div className="image-preview">
                          {imagePreview.map((url, i) => (
                            <img key={i} src={url} alt="" onError={e => (e.target.style.display = 'none')} />
                          ))}
                        </div>
                      )}

                      <div className="tags-section">
                        <label>تگ‌های محصول:</label>
                        <div className="tags-checkboxes">
                          {tags.map(tag => (
                            <label key={tag.name} className="tag-checkbox">
                              <input
                                type="checkbox"
                                checked={form.tags.includes(tag.name)}
                                onChange={() => handleTagToggle(tag.name)}
                              />
                              {tag.name}
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="form-row">
                        <select
                          value={form.audience}
                          onChange={e => setForm({ ...form, audience: e.target.value })}
                        >
                          <option value="all">نمایش برای همه</option>
                          <option value="customers">فقط مشتریان عادی</option>
                          <option value="partners">فقط همکاران</option>
                        </select>
                      </div>

                      <textarea
                        placeholder="توضیحات کامل (HTML)"
                        value={form.fullDescription}
                        onChange={e => setForm({ ...form, fullDescription: e.target.value })}
                        rows="5"
                      />
                      <div className="form-actions">
                        <button type="submit" className="btn-primary">
                          {editingId ? 'ذخیره' : 'افزودن'}
                        </button>
                        <button type="button" className="btn-secondary" onClick={closeForm}>
                          انصراف
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <div className="table-container">
                <table className="products-table">
                  <thead>
                    <tr>
                      {(hasPermission(PERMISSIONS.DELETE_PRODUCT) || hasPermission(PERMISSIONS.BULK_DISCOUNT)) && (
                        <th>
                          <input
                            type="checkbox"
                            checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0}
                            onChange={toggleSelectAll}
                          />
                        </th>
                      )}
                      <th>تصویر</th>
                      <th>کد</th>
                      <th>نام</th>
                      <th>درجه</th>
                      <th>قیمت</th>
                      <th>قیمت همکار</th>
                      <th>موجودی</th>
                      <th>دسته</th>
                      <th>نوع خاک</th>
                      <th>نوع لعاب</th>
                      <th>سایز</th>
                      <th>رنگ</th>
                      <th>تگ‌ها</th>
                      <th>مخاطب</th>
                      <th>عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map(p => (
                      <tr key={p.id}>
                        {(hasPermission(PERMISSIONS.DELETE_PRODUCT) || hasPermission(PERMISSIONS.BULK_DISCOUNT)) && (
                          <td>
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(p.id)}
                              onChange={() => toggleSelect(p.id)}
                            />
                          </td>
                        )}
                        <td>
                          <img src={getProductImage(p)} alt="" className="table-thumb" />
                        </td>
                        <td>{p.productCode || '---'}</td>
                        <td>{p.name}</td>
                        <td>{p.grade || '---'}</td>
                        <td>{p.price.toLocaleString()} تومان</td>
                        <td>{p.partnerPrice ? p.partnerPrice.toLocaleString() : '---'} تومان</td>
                        <td>{p.stock || 0}</td>
                        <td>{p.category || '---'}</td>
                        <td>{p.glazeType || '---'}</td>
                        <td>{p.glaze || '---'}</td>
                        <td>{p.size || '---'}</td>
                        <td>{p.color || '---'}</td>
                        <td>{p.tags?.join(', ') || '---'}</td>
                        <td>
                          {p.audience === 'all' ? 'همه' : p.audience === 'customers' ? 'مشتریان' : 'همکاران'}
                        </td>
                        <td className="table-actions">
                          {hasPermission(PERMISSIONS.EDIT_PRODUCT) && (
                            <button className="edit-btn" onClick={() => handleEdit(p)}>
                              ✏️
                            </button>
                          )}
                          {hasPermission(PERMISSIONS.DELETE_PRODUCT) && (
                            <button className="delete-btn" onClick={() => handleDelete(p.id)}>
                              🗑️
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* برندها */}
          {activeMenu === 'brands' && (
            <div className="brands-view">
              <h2>مدیریت برندها (شرکت‌ها)</h2>
              <div className="brand-form">
                <input
                  type="text"
                  placeholder="نام برند جدید"
                  value={brandForm}
                  onChange={e => setBrandForm(e.target.value)}
                />
                {editingBrand ? (
                  <>
                    <button className="btn-primary" onClick={handleUpdateBrand}>
                      ذخیره
                    </button>
                    <button className="btn-secondary" onClick={cancelEditBrand}>
                      انصراف
                    </button>
                  </>
                ) : (
                  <button className="btn-primary" onClick={handleAddBrand}>
                    افزودن
                  </button>
                )}
              </div>
              <div className="brands-list">
                <h3>لیست برندها ({brands.length})</h3>
                {brands.length === 0 ? (
                  <p>هیچ برندی ثبت نشده است.</p>
                ) : (
                  <table className="brands-table">
                    <thead>
                      <tr>
                        <th>نام برند</th>
                        <th>فعال</th>
                        <th>عملیات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {brands.map(brand => (
                        <tr key={brand.name}>
                          <td>{brand.name}</td>
                          <td>
                            <input
                              type="checkbox"
                              checked={brand.enabled}
                              onChange={e => handleToggleBrand(brand.name, e.target.checked)}
                            />
                          </td>
                          <td>
                            <button className="edit-btn" onClick={() => startEditBrand(brand.name)}>
                              ✏️
                            </button>
                            <button className="delete-btn" onClick={() => handleDeleteBrand(brand.name)}>
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* تگ‌ها */}
          {activeMenu === 'tags' && (
            <div className="tags-view">
              <h2>مدیریت تگ‌ها</h2>
              <div className="tag-form">
                <input
                  type="text"
                  placeholder="نام تگ جدید"
                  value={tagForm}
                  onChange={e => setTagForm(e.target.value)}
                />
                {editingTag ? (
                  <>
                    <button className="btn-primary" onClick={handleUpdateTag}>
                      ذخیره
                    </button>
                    <button className="btn-secondary" onClick={cancelEditTag}>
                      انصراف
                    </button>
                  </>
                ) : (
                  <button className="btn-primary" onClick={handleAddTag}>
                    افزودن
                  </button>
                )}
              </div>
              <div className="tags-list">
                <h3>لیست تگ‌ها ({tags.length})</h3>
                {tags.length === 0 ? (
                  <p>هیچ تگی ثبت نشده است.</p>
                ) : (
                  <table className="tags-table">
                    <thead>
                      <tr>
                        <th>نام تگ</th>
                        <th>فعال</th>
                        <th>عملیات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tags.map(tag => (
                        <tr key={tag.name}>
                          <td>{tag.name}</td>
                          <td>
                            <input
                              type="checkbox"
                              checked={tag.enabled}
                              onChange={e => handleToggleTag(tag.name, e.target.checked)}
                            />
                          </td>
                          <td>
                            <button className="edit-btn" onClick={() => startEditTag(tag.name)}>
                              ✏️
                            </button>
                            <button className="delete-btn" onClick={() => handleDeleteTag(tag.name)}>
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* همکاران */}
          {activeMenu === 'partners' && (
            <div className="partners-view">
              <h2>درخواست‌های همکاری در انتظار تأیید</h2>
              {pendingPartners.length === 0 ? (
                <p>هیچ درخواستی در انتظار نیست.</p>
              ) : (
                <div className="table-container">
                  <table className="products-table">
                    <thead>
                      <tr>
                        <th>نام</th>
                        <th>نام خانوادگی</th>
                        <th>ایمیل</th>
                        <th>تلفن</th>
                        <th>تاریخ ثبت</th>
                        <th>عملیات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingPartners.map(p => (
                        <tr key={p.id}>
                          <td>{p.firstName}</td>
                          <td>{p.lastName}</td>
                          <td>{p.email}</td>
                          <td>{p.phone}</td>
                          <td>{new Date(p.createdAt).toLocaleDateString('fa-IR')}</td>
                          <td>
                            <button className="approve-btn" onClick={() => handleApprovePartner(p.id)}>
                              ✅ تأیید
                            </button>
                            <button className="reject-btn" onClick={() => handleRejectPartner(p.id)}>
                              ❌ رد
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ایجاد پیش‌فاکتور */}
          {activeMenu === 'create-quote' && <CreateQuotePage />}

          {/* لیست پیش‌فاکتورها */}
          {activeMenu === 'quotes' && <QuotesListPage />}

          {/* ورود/خروج داده */}
          {activeMenu === 'data' && (
            <div className="data-io-view">
              <h2>ورود و خروج داده</h2>
              <p className="section-desc">انتخاب فرمت فایل برای ورود یا خروج اطلاعات محصولات.</p>

              <div className="format-selector">
                <label className={ioFormat === 'json' ? 'active' : ''}>
                  <input type="radio" value="json" checked={ioFormat === 'json'} onChange={() => setIoFormat('json')} /> JSON
                </label>
                <label className={ioFormat === 'csv' ? 'active' : ''}>
                  <input type="radio" value="csv" checked={ioFormat === 'csv'} onChange={() => setIoFormat('csv')} /> CSV
                </label>
                <label className={ioFormat === 'excel' ? 'active' : ''}>
                  <input type="radio" value="excel" checked={ioFormat === 'excel'} onChange={() => setIoFormat('excel')} /> Excel
                </label>
              </div>

              <div className="io-card">
                <h3>📥 ورود داده</h3>
                <div className="file-upload-row">
                  <input
                    type="file"
                    id="file-input"
                    accept={ioFormat === 'json' ? '.json' : ioFormat === 'csv' ? '.csv' : '.xlsx,.xls'}
                    onChange={handleFileSelect}
                  />
                  <button className="btn-primary" onClick={handleImport}>
                    شروع وارد کردن
                  </button>
                </div>
                {selectedFile && <p className="selected-file">فایل انتخاب شده: {selectedFile.name}</p>}
              </div>

              <div className="io-card">
                <h3>📤 خروجی داده</h3>
                <p>دریافت فایل {ioFormat.toUpperCase()} از تمام محصولات فعلی.</p>
                <button className="btn-secondary" onClick={handleExport}>
                  دانلود خروجی
                </button>
              </div>

              <div className="io-card">
                <h3>📋 قالب نمونه</h3>
                <p>دانلود یک فایل {ioFormat.toUpperCase()} نمونه با ساختار صحیح.</p>
                <button className="btn-outline" onClick={downloadTemplate}>
                  دانلود قالب
                </button>
              </div>
            </div>
          )}

          {/* تنظیمات */}
          {activeMenu === 'settings' && (
            <div className="settings-view">
              <h3>تنظیمات عمومی</h3>

              {hasPermission(PERMISSIONS.EDIT_SALES_MODE) && (
                <div className="setting-group">
                  <label>روش فروش:</label>
                  <div className="radio-group">
                    <label>
                      <input
                        type="radio"
                        name="salesMode"
                        value="cart"
                        checked={tempSalesMode === 'cart'}
                        onChange={handleTempSalesModeChange}
                      />
                      سبد خرید (افزودن به سبد)
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="salesMode"
                        value="contact"
                        checked={tempSalesMode === 'contact'}
                        onChange={handleTempSalesModeChange}
                      />
                      تماس با ما (نمایش شماره)
                    </label>
                  </div>
                  <button className="btn-primary" onClick={handleSaveSettings} style={{ marginTop: '15px' }}>
                    💾 ذخیره تنظیمات
                  </button>
                </div>
              )}

              {hasPermission(PERMISSIONS.EDIT_LANDING_TAGS) && (
                <div className="setting-group">
                  <label>انتخاب تگ‌های نمایش در صفحه اصلی (سه بخش):</label>
                  <div className="landing-tags-selector">
                    {[0, 1, 2].map(index => (
                      <select
                        key={index}
                        value={landingTags[index] || ''}
                        onChange={e => {
                          const newTags = [...landingTags];
                          newTags[index] = e.target.value;
                          setLandingTagsState(newTags);
                        }}
                        className="tag-select"
                      >
                        <option value="">انتخاب تگ {index + 1}</option>
                        {availableTagsForSelect.map(tag => (
                          <option key={tag} value={tag}>
                            {tag}
                          </option>
                        ))}
                      </select>
                    ))}
                  </div>
                  <button className="btn-primary" onClick={handleSaveLandingTags} style={{ marginTop: '15px' }}>
                    💾 ذخیره تگ‌های صفحه اصلی
                  </button>
                </div>
              )}

              {hasPermission(PERMISSIONS.RESET_DATA) && (
                <>
                  <p>بازنشانی تمام داده‌ها به حالت پیش‌فرض اولیه.</p>
                  <button className="btn-primary" onClick={handleReset}>
                    🔄 بازنشانی داده‌ها
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </main>

      {duplicateModal.isOpen && (
        <div className="modal-overlay">
          <div className="duplicate-modal">
            <h3>⚠️ کد محصول تکراری</h3>
            <p>
              کد <strong>«{duplicateModal.productName}»</strong> از قبل وجود دارد. چه اقدامی انجام دهم؟
            </p>
            <div className="modal-buttons">
              <button onClick={() => duplicateModal.onResolve('update')} className="btn-update">
                🔄 به‌روزرسانی قیمت و موجودی
              </button>
              <button onClick={() => duplicateModal.onResolve('skip')} className="btn-skip">
                ⏭️ رد کردن
              </button>
              <button onClick={() => duplicateModal.onResolve('updateAll')} className="btn-update-all">
                ✅ به‌روزرسانی همه
              </button>
              <button onClick={() => duplicateModal.onResolve('skipAll')} className="btn-skip-all">
                ❌ رد کردن همه
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeePanel;
