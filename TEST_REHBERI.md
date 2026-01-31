# Bulk Payment System - Test Rehberi

Sistem tamamen hazır! İşte adım adım nasıl test edeceğiniz:

## 1. Giriş
- **Adres:** `http://localhost:3000`
- **Tasarım Kontrol:** Mor/Mavi geçişli (gradient) arka plan ve modern bir login kutusu görmelisiniz.
- **Email:** `admin@spacebera.com`
- **Şifre:** `admin123`
- **Tıkla:** "Login to Dashboard"

## 2. Dashboard Kontrolü
- Giriş yaptıktan sonra sade ve şık bir dashboard görmelisiniz.
- "Payment Batches" başlığı altında geçmiş işlemleriniz (eğer varsa) listelenir.
- **Tıklayın:** Sağ üstteki `+ Create New Batch` butonuna.

## 3. Excel Dosyası Hazırlama (Test İçin)
Masaüstünüzde `test_odeme.xlsx` adında bir Excel dosyası oluşturun ve şu satırları yapıştırın:

| phone_number | amount | reference | description |
|--------------|--------|-----------|-------------|
| 0772123456   | 5000   | TEST-01   | Deneme 1    |
| 0701234999   | 10000  | TEST-02   | Hata Testi  |
| 0751234567   | 2000   | TEST-03   | Deneme 3    |

> **Not:** 2. numaradaki `999` bitişi, sistemde "Bakiye Yetersiz" hatası simüle etmek içindir.

## 4. Dosya Yükleme
- Sürükle-bırak alanına hazırladığınız Excel dosyasını bırakın.
- "Reference" kısmına `Aralik Maas Testi` yazın.
- **Tıklayın:** "Create Batch"

## 5. İşlem Takibi
- Yükleme sonrası Dashboard'a yönlendirileceksiniz.
- Oluşturduğunuz batch'i listede göreceksiniz.
- **State:** Önce `NEW`, sonra `PROCESSING`, en son `PARTIAL` veya `DONE` olmalı.
- Sayfayı yenileyerek (F5) durumu takip edebilirsiniz (Worker her 60 saniyede bir çalışır).

## 6. Sonuçları Görme ve Rapor İndirme
- İşlem tamamlandığında (Status: DONE veya PARTIAL), batch satırındaki **"Details"** butonuna tıklayın.
- Açılan sayfada:
  - Başarılı ve başarısız işlem sayılarını görün.
  - Alttaki listede hangi numaranın başarılı, hangisinin hata aldığını inceleyin.
- **Tıklayın:** "📥 Download Report" butonuna.
- İndirilen Excel raporunu açıp sonuçları kontrol edin.

## 7. Tasarım Kontrolü
Test ederken şunlara dikkat edin:
- Butonlara gelince (hover) yumuşak geçişler var mı?
- Kartların gölgeleri şık duruyor mu?
- Arka plan bulanıklığı (glassmorphism) efektleri çalışıyor mu?

---

Eğer tasarım hala eski görünüyorsa, tarayıcınızda **CTRL + F5** (veya CMD + R) yaparak önbelleği temizleyin.
