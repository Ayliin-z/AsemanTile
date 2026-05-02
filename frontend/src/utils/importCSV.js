/**
 * تبدیل فایل CSV به آرایه‌ای از محصولات
 */
export const importProductsFromCSV = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        let text = e.target.result
        if (text.charCodeAt(0) === 0xFEFF) {
          text = text.slice(1)
        }

        const rows = parseCSV(text)
        if (rows.length < 2) {
          reject(new Error('فایل باید حداقل شامل یک سطر عنوان و یک سطر داده باشد'))
          return
        }

        const headers = rows[0].map(h => h.trim())
        const products = []

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i]
          if (row.length === 0 || row.every(cell => cell === '')) continue

          const product = {}
          headers.forEach((header, index) => {
            let value = row[index] !== undefined ? row[index] : ''
            
            if (header === 'price' || header === 'قیمت') {
              value = Number(value) || 0
            } else if (header === 'partnerPrice' || header === 'قیمت همکار') {
              value = Number(value) || 0
            } else if (header === 'discount' || header === 'تخفیف') {
              value = Number(value) || 0
            } else if (header === 'stock' || header === 'موجودی' || header === 'متراژ موجودی') {
              value = Number(value) || 0
            } else if (header === 'images' || header === 'تصاویر') {
              if (typeof value === 'string') {
                value = value.split(/[,;]/).map(s => s.trim()).filter(Boolean)
              } else {
                value = []
              }
            } else {
              value = String(value)
            }
            product[header] = value
          })

          const mapped = mapCSVFields(product)
          if (mapped.name) {
            products.push(mapped)
          }
        }

        resolve(products)
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = reject
    reader.readAsText(file, 'UTF-8')
  })
}

const parseCSV = (text) => {
  const rows = []
  let row = []
  let cell = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const nextChar = text[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        cell += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      row.push(cell)
      cell = ''
    } else if (char === '\n' && !inQuotes) {
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
      if (nextChar === '\r') i++
    } else if (char === '\r' && !inQuotes) {
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else {
      cell += char
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell)
    rows.push(row)
  }

  return rows.filter(r => r.some(c => c.trim() !== ''))
}

const mapCSVFields = (csvRow) => {
  const fieldMap = {
    'کد محصول': 'productCode', 'productCode': 'productCode',
    'درجه': 'grade', 'grade': 'grade',
    'نام': 'name', 'name': 'name',
    'قیمت': 'price', 'price': 'price',
    'قیمت همکار': 'partnerPrice', 'partnerPrice': 'partnerPrice',
    'تخفیف': 'discount', 'discount': 'discount',
    'موجودی': 'stock', 'متراژ موجودی': 'stock', 'stock': 'stock',
    'توضیحات': 'description', 'description': 'description',
    'شرکت سازنده': 'manufacturer', 'manufacturer': 'manufacturer',
    'نوع لعاب': 'glazeType', 'glazeType': 'glazeType',
    'مناسب برای': 'suitableFor', 'suitableFor': 'suitableFor',
    'دسته‌بندی': 'category', 'category': 'category',
    'سایز': 'size', 'size': 'size',
    'لعاب': 'glaze', 'glaze': 'glaze',
    'رنگ': 'color', 'color': 'color',
    'تصاویر': 'images', 'images': 'images',
    'توضیحات کامل': 'fullDescription', 'fullDescription': 'fullDescription',
    'تگ‌ها': 'tags', 'tags': 'tags',
    'مخاطب': 'audience', 'audience': 'audience',
  }

  const mapped = {}
  Object.keys(csvRow).forEach(key => {
    const englishKey = fieldMap[key] || key
    mapped[englishKey] = csvRow[key]
  })

  let tags = mapped.tags || ''
  if (typeof tags === 'string') {
    tags = tags.split(/[,;]/).map(s => s.trim()).filter(Boolean)
  } else if (!Array.isArray(tags)) {
    tags = []
  }

  return {
    productCode: mapped.productCode || '',
    grade: mapped.grade || '',
    name: mapped.name || 'بدون نام',
    price: Number(mapped.price) || 0,
    partnerPrice: mapped.partnerPrice !== undefined ? Number(mapped.partnerPrice) : Number(mapped.price) || 0,
    discount: Number(mapped.discount) || 0,
    stock: Number(mapped.stock) || 0,
    description: mapped.description || '',
    manufacturer: mapped.manufacturer || '',
    glazeType: mapped.glazeType || '',
    suitableFor: mapped.suitableFor || '',
    category: mapped.category || '',
    size: mapped.size || '',
    glaze: mapped.glaze || '',
    color: mapped.color || '',
    images: Array.isArray(mapped.images) ? mapped.images : [],
    fullDescription: mapped.fullDescription || '',
    tags: tags,
    audience: mapped.audience || 'all',
  }
}
