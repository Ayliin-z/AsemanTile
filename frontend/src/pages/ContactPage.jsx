// frontend/src/pages/ContactPage.jsx
import './ContactPage.css'
import contactImage from '/images/contact.jpg'

const ContactPage = () => {
  return (
    <div className="contact-page">
      <div className="container">
        {/* ===== بخش بالایی: عکس (چپ) + متن (راست) ===== */}
        <section className="contact-hero">
          <div className="contact-hero-image">
            <img src={contactImage} alt="تماس با کاشی و سرامیک آسمان" />
          </div>
          <div className="contact-hero-text">
            <h1>تماس با ما</h1>
            <p className="contact-intro">
              در گروه بازرگانی کاشی و سرامیک آسمان، همواره آمادهٔ پاسخ‌گویی به
              سؤالات و همراهی شما عزیزان هستیم. اگر به مشاوره برای انتخاب محصول،
              اطلاعات بیشتر یا پیگیری سفارش نیاز دارید، با ما در ارتباط باشید.
              از طریق فرم تماس یا شماره‌های درج‌شده می‌توانید با ما تماس بگیرید.
              منتظر شنیدن صدای گرم شما هستیم!
            </p>
          </div>
        </section>

        {/* ===== ردیف کارت‌های اطلاعات تماس (۴ لوزی) ===== */}
        <div className="contact-cards">
          <div className="contact-card">
            <div className="card-icon">📍</div>
            <h3>ملاقات حضوری</h3>
            <p>شیراز، بلوار پاسداران، نبش کوچه ۶۰، طبقه دوم بانک سیه</p>
          </div>
          <div className="contact-card">
            <div className="card-icon">📞</div>
            <h3>شماره تلفن ثابت</h3>
            <p>۰۷۱-۴۳۳۰۴۳۳</p>
          </div>
          <div className="contact-card">
            <div className="card-icon">📱</div>
            <h3>شماره موبایل</h3>
            <p>۰۹۱۰۷۸۰۶۳۹۸</p>
          </div>
          <div className="contact-card">
            <div className="card-icon">✉️</div>
            <h3>آدرس ایمیل</h3>
            <p>info@asemantile.com</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactPage
