import { getProductByCode, addProduct, updateProduct } from './storage';

export const importProductsFromExcel = (file) => {
  return new Promise((resolve, reject) => {
    if (!window.XLSX) {
      reject(new Error('کتابخانه Excel بارگذاری نشده است'))
      return
    }

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = window.XLSX.read(data, { type: 'array' })
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = window.XLSX.utils.sheet_to_json(firstSheet)
        
        if (jsonData.length === 0) {
          reject(new Error('فایل خالی است'))
          return
        }

        const results = {
          added: [],
          updated: [],
          errors: []
        };

        for (const row of jsonData) {
          try {
            const productCode = row['کد محصول'] || row['productCode'] || row['productcode'] || '';
            if (!productCode) {
              results.errors.push({ row, error: 'کد محصول الزامی است' });
              continue;
            }

            const name = row['نام'] || row['name'] || '';
            if (!name) {
              results.errors.push({ row, error: 'نام محصول الزامی است' });
              continue;
            }

            const productData = {
              productCode: productCode,
              grade: row['درجه'] || row['grade'] || '',
              name: name,
              price: Number(row['قیمت'] || row['price'] || 0),
              partnerPrice: Number(row['قیمت همکار'] || row['partnerPrice'] || 0),
              discount: Number(row['تخفیف'] || row['discount'] || 0),
              stock: Number(row['موجودی'] || row['stock'] || row['متراژ موجودی'] || 0),
              description: row['توضیحات'] || row['description'] || '',
              manufacturer: row['شرکت سازنده'] || row['manufacturer'] || '',
              glazeType: row['نوع لعاب'] || row['glazeType'] || '',
              suitableFor: row['مناسب برای'] || row['suitableFor'] || '',
              category: row['دسته‌بندی'] || row['category'] || '',
              size: row['سایز'] || row['size'] || '',
              glaze: row['لعاب'] || row['glaze'] || '',
              color: row['رنگ'] || row['color'] || '',
              fullDescription: row['توضیحات کامل'] || row['fullDescription'] || '',
              tags: row['تگ‌ها'] ? String(row['تگ‌ها']).split(/[,;]/).map(s => s.trim()).filter(Boolean) : [],
              audience: row['مخاطب'] || row['audience'] || 'all'
            };

            // پردازش تصاویر
            const imagesField = row['تصاویر'] || row['images'];
            if (imagesField && typeof imagesField === 'string') {
              productData.images = imagesField.split(/[,;]/).map(s => s.trim()).filter(Boolean);
            } else {
              productData.images = [];
            }

            // بررسی وجود محصول
            const existing = await getProductByCode(productCode);
            
            if (existing) {
              // بروزرسانی
              await updateProduct(existing.id, {
                price: productData.price,
                partnerPrice: productData.partnerPrice,
                stock: productData.stock,
                name: productData.name,
                manufacturer: productData.manufacturer,
                description: productData.description
              });
              results.updated.push({ productCode, name: productData.name });
            } else {
              // افزودن جدید
              await addProduct(productData);
              results.added.push({ productCode, name: productData.name });
            }
          } catch (err) {
            results.errors.push({ row, error: err.message });
          }
        }

        resolve(results);
      } catch (error) {
        reject(error);
      }
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}
