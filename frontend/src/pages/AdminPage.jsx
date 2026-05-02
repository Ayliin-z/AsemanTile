// frontend/src/pages/AdminPage.jsx
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
import { logout } from '../utils/auth';
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
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from '../utils/employeeAuth';
import { PERMISSIONS, PERMISSIONS_LIST } from '../utils/permissions';
import {
  getBlogPosts,
  addBlogPost,
  updateBlogPost,
  deleteBlogPost,
  toggleHomepageDisplay,
} from '../utils/blog';
import {
  getProductTemplates,
  addProductTemplate,
  updateProductTemplate,
  deleteProductTemplate,
} from '../utils/productTemplates';
import CreateQuotePage from './CreateQuotePage';
import QuotesListPage from './QuotesListPage';
import './AdminPage.css';

const AdminPage = () => {
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
  const [employees, setEmployees] = useState([]);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    email: '',
    password: '',
    permissions: [],
  });
  const [blogPosts, setBlogPosts] = useState([]);
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [editingBlogId, setEditingBlogId] = useState(null);
  const [blogForm, setBlogForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    image: '',
  });
  const [blogImageFile, setBlogImageFile] = useState(null);
  const [blogImagePreview, setBlogImagePreview] = useState('');
  const [bulkDiscountBar, setBulkDiscountBar] = useState({
    isOpen: false,
    discountType: 'percent',
    discountValue: '',
  });
  const [templates, setTemplates] = useState([]);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [templateForm, setTemplateForm] = useState({
    size: '',
    glaze_type: '',
    title: '',
    description: '',
    usage_guide: '',
    maintenance: '',
  });

  // گروه‌بندی منوها
  const [openGroups, setOpenGroups] = useState({
    products: true,
    sales: false,
    site: false,
  });
  const toggleGroup = (group) => setOpenGroups(prev => ({ ...prev, [group]: !prev[group] }));

  // ========== بارگذاری اولیه ==========
  useEffect(() => {
    refreshProducts();
    const loadInitialTags = async () => {
      const tagsData = await getTags();
      setTags(Array.isArray(tagsData) ? tagsData : []);
    };
    loadInitialTags();
  }, []);

  useEffect(() => {
    if (showForm) {
      const loadTagsForForm = async () => {
        const tagsData = await getTags();
        setTags(Array.isArray(tagsData) ? tagsData : []);
      };
      loadTagsForForm();
    }
  }, [showForm]);

  useEffect(() => {
    if (activeMenu === 'partners') loadPendingPartners();
    if (activeMenu === 'brands') loadBrandsData();
    if (activeMenu === 'tags') loadTagsData();
    if (activeMenu === 'employees') loadEmployeesData();
    if (activeMenu === 'blog') loadBlogPostsData();
    if (activeMenu === 'templates') loadTemplatesData();
    if (activeMenu === 'settings') loadSettingsData();
  }, [activeMenu]);

  const refreshProducts = async () => {
    const prods = await getProducts();
    setProducts(prods);
  };
  const loadPendingPartners = () => setPendingPartners(getPendingPartners());
  const loadBrandsData = async () => {
    const data = await getBrands();
    setBrands(Array.isArray(data) ? data : []);
  };
  const loadTagsData = async () => {
    const data = await getTags();
    setTags(Array.isArray(data) ? data : []);
  };
  const loadEmployeesData = async () => {
    const data = await getEmployees();
    setEmployees(Array.isArray(data) ? data : []);
  };
  const loadBlogPostsData = async () => {
    const data = await getBlogPosts();
    setBlogPosts(Array.isArray(data) ? data : []);
  };
  const loadTemplatesData = async () => {
    const data = await getProductTemplates();
    setTemplates(data);
  };
  const loadSettingsData = async () => {
    const s = await getSiteSettings();
    setSiteSettings(s);
    setTempSalesMode(s.salesMode);
    setLandingTagsState(s.landingTags || ['فروش ویژه', 'جدید', 'پرفروش']);
    const tagsData = await getTags();
    setAvailableTagsForSelect(tagsData.map(t => t.name));
  };

  // ========== آمار و فیلتر محصولات ==========
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
    setDiscountOnly(false);
    setFilterCategory('');
    setSearchTerm('');
    setActiveMenu('products');
  };
  const handleCategoriesClick = () => {
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
    setDiscountOnly(true);
    setFilterCategory('');
    setSearchTerm('');
    setActiveMenu('products');
  };

  // ========== مدیریت تگ‌ها در فرم ==========
  const handleTagToggle = (tag) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag],
    }));
  };

  // ========== افزودن/ویرایش محصول ==========
  const handleSubmit = async (e) => {
    e.preventDefault();
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
      await ensureBrandExists(form.manufacturer);
      await loadBrandsData();
    }
    for (const tag of form.tags) {
      await ensureTagExists(tag);
    }
    await loadTagsData();
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
    if (window.confirm('آیا از حذف این محصول اطمینان دارید؟')) {
      await deleteProduct(id);
      await refreshProducts();
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    }
  };

  const handleBulkDelete = async () => {
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
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]));
  };
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length && filteredProducts.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map(p => p.id));
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  const handleReset = async () => {
    if (window.confirm('آیا از بازنشانی به داده‌های پیش‌فرض اطمینان دارید؟')) {
      await resetToDefault();
      await refreshProducts();
      alert('داده‌ها به حالت اولیه بازگشتند.');
      setFilterCategory('');
      setSearchTerm('');
      setDiscountOnly(false);
    }
  };

  // ========== Import / Export ==========
  const handleFileSelect = (e) => setSelectedFile(e.target.files[0]);
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
    if (!selectedFile) {
      alert('لطفاً یک فایل انتخاب کنید.');
      return;
    }
    if (ioFormat === 'excel' && !window.XLSX) {
      alert('کتابخانه Excel بارگذاری نشده است.');
      return;
    }
    try {
      if (ioFormat === 'json') {
        const text = await selectedFile.text();
        const result = await importData(text);
        if (result.success) alert('وارد کردن با موفقیت انجام شد.');
        else throw new Error(result.error);
      } else if (ioFormat === 'csv') {
        const importedProducts = await importProductsFromCSV(selectedFile);
        let added = 0,
          updated = 0;
        for (const p of importedProducts) {
          const existing = products.find(prod => prod.productCode === p.productCode);
          if (existing) {
            await updateProduct(existing.id, {
              price: p.price,
              partnerPrice: p.partnerPrice,
              stock: p.stock,
            });
            updated++;
          } else {
            await addProduct(p);
            added++;
          }
        }
        alert(`✅ ${added} محصول جدید اضافه شد، ${updated} محصول به‌روزرسانی شد.`);
      } else if (ioFormat === 'excel') {
        const result = await importProductsFromExcel(selectedFile);
        if (result.errors?.length) alert(`⚠️ ${result.errors.length} خطا در وارد کردن وجود دارد.`);
        if (result.added?.length) alert(`✅ ${result.added.length} محصول جدید اضافه شد.`);
        if (result.updated?.length) alert(`🔄 ${result.updated.length} محصول به‌روزرسانی شد.`);
      }
      await refreshProducts();
    } catch (error) {
      alert('خطا در وارد کردن فایل: ' + error.message);
    } finally {
      setSelectedFile(null);
      document.getElementById('file-input').value = '';
    }
  };
  const handleExport = async () => {
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

  // ========== مدیریت برندها ==========
  const handleAddBrand = async () => {
    const result = await addBrand(brandForm);
    if (result.success) {
      setBrands(result.brands);
      setBrandForm('');
    } else alert(result.error);
  };
  const handleUpdateBrand = async () => {
    if (!editingBrand) return;
    const result = await updateBrand(editingBrand, brandForm);
    if (result.success) {
      setBrands(result.brands);
      setBrandForm('');
      setEditingBrand(null);
    } else alert(result.error);
  };
  const handleDeleteBrand = async name => {
    if (window.confirm(`برند "${name}" حذف شود؟`)) {
      const result = await deleteBrand(name);
      setBrands(result.brands);
    }
  };
  const handleToggleBrand = async (brandName, enabled) => {
    const result = await toggleBrandEnabled(brandName, enabled);
    if (result.success) setBrands(result.brands);
  };
  const startEditBrand = name => {
    setEditingBrand(name);
    setBrandForm(name);
  };
  const cancelEditBrand = () => {
    setEditingBrand(null);
    setBrandForm('');
  };

  // ========== مدیریت تگ‌ها ==========
  const handleAddTag = async () => {
    const result = await addTag(tagForm);
    if (result.success) {
      setTags(result.tags);
      setTagForm('');
    } else alert(result.error);
  };
  const handleUpdateTag = async () => {
    if (!editingTag) return;
    const result = await updateTag(editingTag, tagForm);
    if (result.success) {
      setTags(result.tags);
      setTagForm('');
      setEditingTag(null);
    } else alert(result.error);
  };
  const handleDeleteTag = async name => {
    if (window.confirm(`تگ "${name}" حذف شود؟`)) {
      const result = await deleteTag(name);
      setTags(result.tags);
    }
  };
  const handleToggleTag = async (tagName, enabled) => {
    const result = await toggleTagEnabled(tagName, enabled);
    if (result.success) setTags(result.tags);
  };
  const startEditTag = name => {
    setEditingTag(name);
    setTagForm(name);
  };
  const cancelEditTag = () => {
    setEditingTag(null);
    setTagForm('');
  };

  // ========== مدیریت همکاران ==========
  const handleApprovePartner = id => {
    if (window.confirm('تأیید این همکار؟')) {
      approvePartner(id);
      loadPendingPartners();
    }
  };
  const handleRejectPartner = id => {
    if (window.confirm('رد درخواست و حذف این کاربر؟')) {
      rejectPartner(id);
      loadPendingPartners();
    }
  };

  // ========== تنظیمات سایت ==========
  const handleTempSalesModeChange = e => setTempSalesMode(e.target.value);
  const handleSaveSettings = async () => {
    const success = await setSalesMode(tempSalesMode);
    if (success) {
      setSiteSettings({ salesMode: tempSalesMode });
      alert('تنظیمات با موفقیت ذخیره شد.');
    } else alert('خطا در ذخیره تنظیمات.');
  };
  const handleSaveLandingTags = async () => {
    const success = await setLandingTags(landingTags);
    if (success) alert('تگ‌های صفحه اصلی با موفقیت ذخیره شد.');
    else alert('خطا در ذخیره تگ‌ها.');
  };

  // ========== مدیریت کارمندان ==========
  const handleEmployeeSubmit = async () => {
    if (!employeeForm.name || !employeeForm.email || !employeeForm.password) {
      alert('نام، ایمیل و رمز عبور الزامی هستند.');
      return;
    }
    if (editingEmployee) {
      const result = await updateEmployee(editingEmployee.id, employeeForm);
      if (result.success) {
        await loadEmployeesData();
        setShowEmployeeForm(false);
        setEditingEmployee(null);
        setEmployeeForm({ name: '', email: '', password: '', permissions: [] });
        alert('کارمند با موفقیت ویرایش شد.');
      } else alert(result.error);
    } else {
      const result = await createEmployee(employeeForm);
      if (result.success) {
        await loadEmployeesData();
        setShowEmployeeForm(false);
        setEmployeeForm({ name: '', email: '', password: '', permissions: [] });
        alert('کارمند با موفقیت ایجاد شد.');
      } else alert(result.error);
    }
  };
  const handleEditEmployee = emp => {
    setEditingEmployee(emp);
    setEmployeeForm({
      name: emp.name,
      email: emp.email,
      password: '',
      permissions: [...(emp.permissions || [])],
    });
    setShowEmployeeForm(true);
  };
  const handleDeleteEmployee = async id => {
    if (window.confirm('آیا از حذف این کارمند اطمینان دارید؟')) {
      await deleteEmployee(id);
      await loadEmployeesData();
    }
  };

  // ========== مدیریت وبلاگ ==========
  const handleBlogImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      setBlogImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setBlogImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };
  const readFileAsBase64 = file => {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  };
  const handleWordUpload = e => {
    const file = e.target.files[0];
    if (!file) return;
    if (typeof window.mammoth === 'undefined') {
      alert('کتابخانه mammoth بارگذاری نشده است.');
      return;
    }
    const reader = new FileReader();
    reader.onload = async event => {
      const arrayBuffer = event.target.result;
      const result = await window.mammoth.extractRawText({ arrayBuffer });
      setBlogForm(prev => ({ ...prev, content: result.value }));
    };
    reader.readAsArrayBuffer(file);
  };
  const handleBlogSubmit = async () => {
    if (!blogForm.title || !blogForm.slug || !blogForm.content) {
      alert('عنوان، اسلاگ و متن اصلی الزامی هستند');
      return;
    }
    const existing = blogPosts.find(p => p.slug === blogForm.slug && p.id !== editingBlogId);
    if (existing) {
      alert('این اسلاگ قبلاً استفاده شده است');
      return;
    }
    let imageBase64 = blogForm.image;
    if (blogImageFile) {
      imageBase64 = await readFileAsBase64(blogImageFile);
    }
    const postData = {
      title: blogForm.title,
      slug: blogForm.slug,
      excerpt: blogForm.excerpt,
      content: blogForm.content,
      image: imageBase64 || '',
    };
    if (editingBlogId) {
      await updateBlogPost(editingBlogId, postData);
      alert('پست ویرایش شد');
    } else {
      await addBlogPost(postData);
      alert('پست جدید اضافه شد');
    }
    await loadBlogPostsData();
    closeBlogForm();
  };
  const closeBlogForm = () => {
    setShowBlogForm(false);
    setEditingBlogId(null);
    setBlogForm({ title: '', slug: '', excerpt: '', content: '', image: '' });
    setBlogImageFile(null);
    setBlogImagePreview('');
  };
  const handleEditBlog = post => {
    setEditingBlogId(post.id);
    setBlogForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      image: post.image || '',
    });
    setBlogImagePreview(post.image || '');
    setShowBlogForm(true);
  };
  const handleDeleteBlog = async id => {
    if (window.confirm('آیا از حذف این پست اطمینان دارید؟')) {
      await deleteBlogPost(id);
      await loadBlogPostsData();
    }
  };
  const handleToggleHomepage = async (id, currentStatus) => {
    try {
      await toggleHomepageDisplay(id, !currentStatus);
      await loadBlogPostsData();
      alert(!currentStatus ? 'مقاله در صفحه اصلی نمایش داده می‌شود' : 'مقاله از صفحه اصلی حذف شد');
    } catch (error) {
      alert('خطا در تغییر وضعیت: ' + error.message);
    }
  };

  // ========== تخفیف گروهی ==========
  const openBulkDiscountBar = () => {
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

  // ========== قالب توضیحات ==========
  const handleTemplateSubmit = async () => {
    if (!templateForm.title || !templateForm.description) {
      alert('عنوان و توضیحات الزامی است');
      return;
    }
    try {
      if (editingTemplateId) {
        await updateProductTemplate(editingTemplateId, templateForm);
        alert('قالب با موفقیت ویرایش شد');
      } else {
        await addProductTemplate(templateForm);
        alert('قالب با موفقیت اضافه شد');
      }
      closeTemplateForm();
      await loadTemplatesData();
    } catch (error) {
      alert('خطا: ' + error.message);
    }
  };
  const handleEditTemplate = template => {
    setEditingTemplateId(template.id);
    setTemplateForm({
      size: template.size || '',
      glaze_type: template.glaze_type || '',
      title: template.title || '',
      description: template.description || '',
      usage_guide: template.usage_guide || '',
      maintenance: template.maintenance || '',
    });
    setShowTemplateForm(true);
  };
  const handleDeleteTemplate = async id => {
    if (window.confirm('آیا از حذف این قالب اطمینان دارید؟')) {
      await deleteProductTemplate(id);
      await loadTemplatesData();
      alert('قالب حذف شد');
    }
  };
  const closeTemplateForm = () => {
    setShowTemplateForm(false);
    setEditingTemplateId(null);
    setTemplateForm({
      size: '',
      glaze_type: '',
      title: '',
      description: '',
      usage_guide: '',
      maintenance: '',
    });
  };

  const getProductImage = product => {
    if (product.images?.length) return product.images[0];
    if (product.image) return product.image;
    return `https://picsum.photos/50/50?random=${product.id}`;
  };

  // ========== رندر بخش‌ها ==========
  const renderProducts = () => (
    <>
      <div className="action-bar">
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          ➕ افزودن محصول
        </button>
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
          {selectedIds.length > 0 && (
            <>
              <button className="icon-btn" onClick={openBulkDiscountBar} title="تخفیف گروهی">
                🏷️
              </button>
              <button className="icon-btn delete-icon" onClick={handleBulkDelete} title="حذف">
                🗑️
              </button>
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
            <button className="search-btn">🔍</button>
          </div>
        </div>
      </div>
      {bulkDiscountBar.isOpen && (
        <div className="bulk-discount-bar">
          <span className="selected-count">{selectedIds.length} محصول انتخاب شده</span>
          <div className="discount-type-selector">
            <label>
              <input
                type="radio"
                value="percent"
                checked={bulkDiscountBar.discountType === 'percent'}
                onChange={() => setBulkDiscountBar({ ...bulkDiscountBar, discountType: 'percent' })}
              />{' '}
              تخفیف درصدی
            </label>
            <label>
              <input
                type="radio"
                value="amount"
                checked={bulkDiscountBar.discountType === 'amount'}
                onChange={() => setBulkDiscountBar({ ...bulkDiscountBar, discountType: 'amount' })}
              />{' '}
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
      {showForm && (
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
                  {tags.length === 0 ? (
                    <p className="no-tags-message">هیچ تگی تعریف نشده است.</p>
                  ) : (
                    tags.map(tag => (
                      <label key={tag.name} className="tag-checkbox">
                        <input
                          type="checkbox"
                          checked={form.tags.includes(tag.name)}
                          onChange={() => handleTagToggle(tag.name)}
                        />
                        {tag.name}
                      </label>
                    ))
                  )}
                </div>
              </div>
              <div className="form-row">
                <select value={form.audience} onChange={e => setForm({ ...form, audience: e.target.value })}>
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
              <th>
                <input
                  type="checkbox"
                  checked={selectedIds.length === filteredProducts.length && filteredProducts.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
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
                <td>
                  <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => toggleSelect(p.id)} />
                </td>
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
                <td>{p.audience === 'all' ? 'همه' : p.audience === 'customers' ? 'مشتریان' : 'همکاران'}</td>
                <td className="table-actions">
                  <button className="edit-btn" onClick={() => handleEdit(p)}>
                    ✏️
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(p.id)}>
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  const renderBrands = () => (
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
  );

  const renderTags = () => (
    <div className="tags-view">
      <h2>مدیریت تگ‌ها</h2>
      <div className="tag-form">
        <input type="text" placeholder="نام تگ جدید" value={tagForm} onChange={e => setTagForm(e.target.value)} />
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
  );

  const renderTemplates = () => (
    <div className="templates-view">
      <div className="action-bar">
        <button className="btn-primary" onClick={() => setShowTemplateForm(true)}>
          ➕ قالب جدید
        </button>
      </div>
      {showTemplateForm && (
        <div className="form-modal">
          <div className="modal-content">
            <h3>{editingTemplateId ? 'ویرایش قالب' : 'قالب جدید'}</h3>
            <form
              onSubmit={e => {
                e.preventDefault();
                handleTemplateSubmit();
              }}
            >
              <div className="form-row">
                <input
                  type="text"
                  placeholder="سایز (مثال: 60*60)"
                  value={templateForm.size}
                  onChange={e => setTemplateForm({ ...templateForm, size: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="نوع لعاب (مثال: براق, مات)"
                  value={templateForm.glaze_type}
                  onChange={e => setTemplateForm({ ...templateForm, glaze_type: e.target.value })}
                />
              </div>
              <input
                type="text"
                placeholder="عنوان *"
                value={templateForm.title}
                onChange={e => setTemplateForm({ ...templateForm, title: e.target.value })}
                required
              />
              <textarea
                placeholder="توضیحات کامل *"
                rows="5"
                value={templateForm.description}
                onChange={e => setTemplateForm({ ...templateForm, description: e.target.value })}
                required
              />
              <textarea
                placeholder="راهنمای کاربرد (مناسب برای...)"
                rows="3"
                value={templateForm.usage_guide}
                onChange={e => setTemplateForm({ ...templateForm, usage_guide: e.target.value })}
              />
              <textarea
                placeholder="نحوه نگهداری و نظافت"
                rows="3"
                value={templateForm.maintenance}
                onChange={e => setTemplateForm({ ...templateForm, maintenance: e.target.value })}
              />
              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  ذخیره
                </button>
                <button type="button" className="btn-secondary" onClick={closeTemplateForm}>
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
              <th>سایز</th>
              <th>نوع لعاب</th>
              <th>عنوان</th>
              <th>توضیحات</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {templates.map(template => (
              <tr key={template.id}>
                <td>{template.size || '—'}</td>
                <td>{template.glaze_type || '—'}</td>
                <td>{template.title}</td>
                <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {template.description.substring(0, 80)}...
                </td>
                <td className="table-actions">
                  <button className="edit-btn" onClick={() => handleEditTemplate(template)}>
                    ✏️
                  </button>
                  <button className="delete-btn" onClick={() => handleDeleteTemplate(template.id)}>
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
            {templates.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center' }}>
                  هیچ قالبی ثبت نشده است
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPartners = () => (
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
  );

  const renderEmployees = () => (
    <div className="employees-view">
      <div className="action-bar">
        <button
          className="btn-primary"
          onClick={() => {
            setEditingEmployee(null);
            setEmployeeForm({ name: '', email: '', password: '', permissions: [] });
            setShowEmployeeForm(true);
          }}
        >
          ➕ کارمند جدید
        </button>
      </div>
      {showEmployeeForm && (
        <div className="form-modal">
          <div className="modal-content">
            <h3>{editingEmployee ? 'ویرایش کارمند' : 'کارمند جدید'}</h3>
            <div className="form-row">
              <input
                placeholder="نام کامل"
                value={employeeForm.name}
                onChange={e => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                required
              />
              <input
                placeholder="ایمیل"
                value={employeeForm.email}
                onChange={e => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                required
              />
            </div>
            <input
              type="password"
              placeholder="رمز عبور"
              value={employeeForm.password}
              onChange={e => setEmployeeForm({ ...employeeForm, password: e.target.value })}
              required={!editingEmployee}
            />
            <div className="permissions-grid">
              {PERMISSIONS_LIST.map(p => (
                <label key={p.key}>
                  <input
                    type="checkbox"
                    checked={employeeForm.permissions.includes(p.key)}
                    onChange={e => {
                      if (e.target.checked)
                        setEmployeeForm({
                          ...employeeForm,
                          permissions: [...employeeForm.permissions, p.key],
                        });
                      else
                        setEmployeeForm({
                          ...employeeForm,
                          permissions: employeeForm.permissions.filter(k => k !== p.key),
                        });
                    }}
                  />
                  {p.label}
                </label>
              ))}
            </div>
            <div className="form-actions">
              <button className="btn-primary" onClick={handleEmployeeSubmit}>
                ذخیره
              </button>
              <button
                className="btn-secondary"
                onClick={() => {
                  setShowEmployeeForm(false);
                  setEditingEmployee(null);
                }}
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>نام</th>
              <th>ایمیل</th>
              <th>دسترسی‌ها</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => (
              <tr key={emp.id}>
                <td>{emp.name}</td>
                <td>{emp.email}</td>
                <td>{emp.permissions?.length || 0} مجوز</td>
                <td className="table-actions">
                  <button className="edit-btn" onClick={() => handleEditEmployee(emp)}>
                    ✏️
                  </button>
                  <button className="delete-btn" onClick={() => handleDeleteEmployee(emp.id)}>
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderBlog = () => (
    <div className="blog-manager">
      <div className="action-bar">
        <button className="btn-primary" onClick={() => setShowBlogForm(true)}>
          ➕ نوشته جدید
        </button>
      </div>
      {showBlogForm && (
        <div className="form-modal">
          <div className="modal-content">
            <h3>{editingBlogId ? 'ویرایش نوشته' : 'نوشته جدید'}</h3>
            <div className="form-row">
              <input
                type="text"
                placeholder="عنوان *"
                value={blogForm.title}
                onChange={e => setBlogForm({ ...blogForm, title: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="اسلاگ (آدرس یکتا) *"
                value={blogForm.slug}
                onChange={e => setBlogForm({ ...blogForm, slug: e.target.value })}
                required
              />
            </div>
            <textarea
              placeholder="خلاصه (توضیح کوتاه)"
              rows="3"
              value={blogForm.excerpt}
              onChange={e => setBlogForm({ ...blogForm, excerpt: e.target.value })}
            />
            <div className="form-row">
              <div className="image-upload" style={{ flex: 1 }}>
                <label>تصویر شاخص:</label>
                <input type="file" accept="image/*" onChange={handleBlogImageChange} />
                {blogImagePreview && (
                  <img src={blogImagePreview} alt="پیش‌نمایش" style={{ width: '100px', marginTop: '10px' }} />
                )}
              </div>
              <div className="word-upload" style={{ flex: 1 }}>
                <label>آپلود فایل ورد (اختیاری):</label>
                <input type="file" accept=".docx" onChange={handleWordUpload} />
                <small>متن فایل جایگزین محتوای فعلی می‌شود</small>
              </div>
            </div>
            <textarea
              placeholder="متن اصلی (HTML مجاز) *"
              rows="10"
              value={blogForm.content}
              onChange={e => setBlogForm({ ...blogForm, content: e.target.value })}
              required
            />
            <div className="form-actions">
              <button className="btn-primary" onClick={handleBlogSubmit}>
                ذخیره
              </button>
              <button className="btn-secondary" onClick={closeBlogForm}>
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>تصویر</th>
              <th>عنوان</th>
              <th>اسلاگ</th>
              <th>تاریخ</th>
              <th>نمایش در صفحه اصلی</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {blogPosts.map(post => (
              <tr key={post.id}>
                <td>
                  {post.image ? <img src={post.image} style={{ width: '50px', height: '50px', objectFit: 'cover' }} alt="" /> : '---'}
                </td>
                <td>{post.title}</td>
                <td>{post.slug}</td>
                <td>{new Date(post.created_at || post.date).toLocaleDateString('fa-IR')}</td>
                <td>
                  <button
                    className={`homepage-toggle-btn ${post.show_on_homepage ? 'active' : ''}`}
                    onClick={() => handleToggleHomepage(post.id, post.show_on_homepage)}
                  >
                    {post.show_on_homepage ? '✅ نمایش داده می‌شود' : '⬜ نمایش داده نمی‌شود'}
                  </button>
                </td>
                <td className="table-actions">
                  <button className="edit-btn" onClick={() => handleEditBlog(post)}>
                    ✏️
                  </button>
                  <button className="delete-btn" onClick={() => handleDeleteBlog(post.id)}>
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderData = () => (
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
  );

  const renderSettings = () => (
    <div className="settings-view">
      <h3>تنظیمات عمومی</h3>
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
            />{' '}
            سبد خرید (افزودن به سبد)
          </label>
          <label>
            <input
              type="radio"
              name="salesMode"
              value="contact"
              checked={tempSalesMode === 'contact'}
              onChange={handleTempSalesModeChange}
            />{' '}
            تماس با ما (نمایش شماره)
          </label>
        </div>
        <button className="btn-primary" onClick={handleSaveSettings} style={{ marginTop: '15px' }}>
          💾 ذخیره تنظیمات
        </button>
      </div>
      <div className="setting-group">
        <label>انتخاب تگ‌های نمایش در صفحه اصلی (سه بخش):</label>
        <div className="landing-tags-selector">
          {[0, 1, 2].map(idx => (
            <select
              key={idx}
              value={landingTags[idx] || ''}
              onChange={e => {
                const newTags = [...landingTags];
                newTags[idx] = e.target.value;
                setLandingTagsState(newTags);
              }}
              className="tag-select"
            >
              <option value="">انتخاب تگ {idx + 1}</option>
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
      <p>بازنشانی تمام داده‌ها به حالت پیش‌فرض اولیه.</p>
      <button className="btn-primary" onClick={handleReset}>
        🔄 بازنشانی داده‌ها
      </button>
    </div>
  );

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>پنل مدیریت</h2>
          <p>کاشی و سرامیک آسمان</p>
        </div>
        <nav className="sidebar-nav">
          {/* گروه محصولات */}
          <div className={`nav-group ${openGroups.products ? 'open' : ''}`}>
            <button className="nav-group-header" onClick={() => toggleGroup('products')}>
              <span className="nav-group-icon">📦</span>
              <span className="nav-group-title">مدیریت محصولات</span>
              <span className="nav-group-arrow">{openGroups.products ? '▼' : '►'}</span>
            </button>
            <div className="nav-group-items">
              <button className={activeMenu === 'products' ? 'active' : ''} onClick={() => setActiveMenu('products')}>
                🧱 لیست محصولات
              </button>
              <button className={activeMenu === 'brands' ? 'active' : ''} onClick={() => setActiveMenu('brands')}>
                🏷️ مدیریت برندها
              </button>
              <button className={activeMenu === 'tags' ? 'active' : ''} onClick={() => setActiveMenu('tags')}>
                🔖 مدیریت تگ‌ها
              </button>
              <button className={activeMenu === 'templates' ? 'active' : ''} onClick={() => setActiveMenu('templates')}>
                📋 قالب توضیحات
              </button>
              <button className={activeMenu === 'data' ? 'active' : ''} onClick={() => setActiveMenu('data')}>
                📤 ورود و خروج داده
              </button>
            </div>
          </div>
          {/* گروه فروش و مشتریان */}
          <div className={`nav-group ${openGroups.sales ? 'open' : ''}`}>
            <button className="nav-group-header" onClick={() => toggleGroup('sales')}>
              <span className="nav-group-icon">🛒</span>
              <span className="nav-group-title">فروش و مشتریان</span>
              <span className="nav-group-arrow">{openGroups.sales ? '▼' : '►'}</span>
            </button>
            <div className="nav-group-items">
              <button className={activeMenu === 'partners' ? 'active' : ''} onClick={() => setActiveMenu('partners')}>
                🤝 درخواست‌های همکاری
              </button>
              <button className={activeMenu === 'create-quote' ? 'active' : ''} onClick={() => setActiveMenu('create-quote')}>
                📄 ایجاد پیش‌فاکتور
              </button>
              <button className={activeMenu === 'invoices' ? 'active' : ''} onClick={() => setActiveMenu('invoices')}>
                📋 لیست پیش‌فاکتورها
              </button>
              <button className={activeMenu === 'contact' ? 'active' : ''} onClick={() => setActiveMenu('contact')}>
                📞 درخواست تماس
              </button>
            </div>
          </div>
          {/* گروه مدیریت سایت */}
          <div className={`nav-group ${openGroups.site ? 'open' : ''}`}>
            <button className="nav-group-header" onClick={() => toggleGroup('site')}>
              <span className="nav-group-icon">⚙️</span>
              <span className="nav-group-title">مدیریت سایت</span>
              <span className="nav-group-arrow">{openGroups.site ? '▼' : '►'}</span>
            </button>
            <div className="nav-group-items">
              <button className={activeMenu === 'employees' ? 'active' : ''} onClick={() => setActiveMenu('employees')}>
                👥 مدیریت کارمندان
              </button>
              <button className={activeMenu === 'blog' ? 'active' : ''} onClick={() => setActiveMenu('blog')}>
                📝 مدیریت وبلاگ
              </button>
              <button className={activeMenu === 'settings' ? 'active' : ''} onClick={() => setActiveMenu('settings')}>
                ⚙️ تنظیمات
              </button>
            </div>
          </div>
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            🚪 خروج
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <header className="main-header-bar">
          <h1>
            {activeMenu === 'dashboard' && 'داشبورد'}
            {activeMenu === 'products' && 'لیست محصولات'}
            {activeMenu === 'brands' && 'مدیریت برندها'}
            {activeMenu === 'tags' && 'مدیریت تگ‌ها'}
            {activeMenu === 'partners' && 'درخواست‌های همکاری'}
            {activeMenu === 'employees' && 'مدیریت کارمندان'}
            {activeMenu === 'blog' && 'مدیریت وبلاگ'}
            {activeMenu === 'data' && 'ورود و خروج داده'}
            {activeMenu === 'settings' && 'تنظیمات'}
            {activeMenu === 'templates' && 'قالب توضیحات محصولات'}
            {activeMenu === 'create-quote' && 'ایجاد پیش‌فاکتور'}
            {activeMenu === 'invoices' && 'لیست پیش‌فاکتورها'}
            {activeMenu === 'contact' && 'درخواست تماس'}
          </h1>
          <div className="header-actions">
            <span>👤 نوع کاربری: ادمین سایت</span>
          </div>
        </header>
        <div className="main-content">
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
          {activeMenu === 'products' && renderProducts()}
          {activeMenu === 'brands' && renderBrands()}
          {activeMenu === 'tags' && renderTags()}
          {activeMenu === 'templates' && renderTemplates()}
          {activeMenu === 'partners' && renderPartners()}
          {activeMenu === 'employees' && renderEmployees()}
          {activeMenu === 'blog' && renderBlog()}
          {activeMenu === 'data' && renderData()}
          {activeMenu === 'settings' && renderSettings()}
          {activeMenu === 'create-quote' && <CreateQuotePage />}
          {activeMenu === 'invoices' && <QuotesListPage />}
          {activeMenu === 'contact' && (
            <div className="contact-requests-view">
              <h2>درخواست‌های تماس</h2>
              <div className="table-container">
                <p>در حال بارگذاری...</p>
              </div>
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

export default AdminPage;
