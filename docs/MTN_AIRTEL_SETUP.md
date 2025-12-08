# MTN ve Airtel API Kurulum Rehberi

Bu doküman, MTN MoMo ve Airtel Money API'lerine nasıl kayıt olunacağını ve production ortamına nasıl geçileceğini açıklar.

## 📱 MTN MoMo API

### Sandbox (Test) Ortamı

#### 1. Kayıt Olun

1. https://momodeveloper.mtn.com/ adresine gidin
2. **Sign Up** butonuna tıklayın
3. Bilgilerinizi girin:
   - İsim
   - E-posta
   - Şirket adı
   - Telefon

4. E-postanıza gelen linke tıklayarak hesabınızı onaylayın

#### 2. Subscription (Abonelik) Oluşturun

1. Dashboard'a gidin
2. **Products** sekmesine tıklayın
3. **Disbursements** ürününü bulun
4. **Subscribe** butonuna tıklayın
5. **Primary Key** (Subscription Key) kopyalayın - bu `MTN_SUBSCRIPTION_KEY` olacak

#### 3. API User Oluşturun

Sandbox'ta API User oluşturmak için şu adımları izleyin:

**Postman veya curl kullanarak:**

```bash
# 1. Önce bir UUID oluşturun (örnek: 12345678-1234-1234-1234-123456789012)
# Online UUID generator: https://www.uuidgenerator.net/

# 2. API User oluşturun
curl -X POST https://sandbox.momodeveloper.mtn.com/v1_0/apiuser \
  -H "X-Reference-Id: 12345678-1234-1234-1234-123456789012" \
  -H "Ocp-Apim-Subscription-Key: YOUR_SUBSCRIPTION_KEY" \
  -H "Content-Type: application/json" \
  -d '{"providerCallbackHost": "https://webhook.site/YOUR-UNIQUE-URL"}'

# 3. API Key oluşturun
curl -X POST https://sandbox.momodeveloper.mtn.com/v1_0/apiuser/12345678-1234-1234-1234-123456789012/apikey \
  -H "Ocp-Apim-Subscription-Key: YOUR_SUBSCRIPTION_KEY"

# Response'da gelen apiKey'i kaydedin
```

#### 4. .env Dosyasını Güncelleyin

```env
MTN_BASE_URL=https://sandbox.momodeveloper.mtn.com
MTN_SUBSCRIPTION_KEY=your_primary_key_here
MTN_API_USER=12345678-1234-1234-1234-123456789012
MTN_API_KEY=api_key_from_response
MTN_TARGET_ENVIRONMENT=sandbox
```

### Production (Canlı) Ortamı

Production ortamına geçmek için:

#### 1. Business Application (İş Başvurusu)

1. MTN Uganda ofisine başvurun
2. Gerekli belgeler:
   - ✅ Şirket Tescil Belgesi (Certificate of Incorporation)
   - ✅ TIN (Vergi Kimlik Numarası) Sertifikası
   - ✅ Yöneticilerin kimlik fotokopileri
   - ✅ Şirket adresi belgesi
   - ✅ Banka hesap bilgileri
   - ✅ Use case açıklaması (maaş, tedarikçi ödemeleri vb.)

3. İletişim:
   - Email: momo@mtn.co.ug
   - Telefon: +256 312 100100

#### 2. Sözleşme İmzalama

MTN size bir sözleşme gönderecek:
- API kullanım şartları
- İşlem başına ücretler
- Günlük/aylık limitler
- SLA (Service Level Agreement)

#### 3. Production Credentials

Sözleşme onaylandıktan sonra:
- Production Subscription Key alacaksınız
- IP adresleriniz whitelist'e eklenecek
- Callback URL'niz kaydedilecek

#### 4. .env Güncelleme

```env
MTN_BASE_URL=https://momodeveloper.mtn.com
MTN_SUBSCRIPTION_KEY=production_subscription_key
MTN_API_USER=production_api_user
MTN_API_KEY=production_api_key
MTN_TARGET_ENVIRONMENT=mtnuganda
```

---

## 📱 Airtel Money API

### Sandbox (Test) Ortamı

#### 1. Kayıt Olun

1. https://developers.airtel.africa/ adresine gidin
2. **Sign Up** butonuna tıklayın
3. Bilgilerinizi girin
4. E-posta onayı yapın

#### 2. Application Oluşturun

1. Dashboard'a gidin
2. **Create Application** butonuna tıklayın
3. Uygulama bilgilerini girin:
   - App Name: "SMS Construction Bulk Payments"
   - Description: "Bulk salary and vendor payments"
   - Category: Business

4. **Disbursements** product'ını seçin

#### 3. Credentials Alın

1. Application detay sayfasında:
   - **Client ID** kopyalayın
   - **Client Secret** kopyalayın (göstermek için icon'a tıklayın)

#### 4. .env Dosyasını Güncelleyin

```env
AIRTEL_BASE_URL=https://openapiuat.airtel.africa
AIRTEL_CLIENT_ID=your_client_id
AIRTEL_CLIENT_SECRET=your_client_secret
```

### Production (Canlı) Ortamı

#### 1. Business Application

1. Airtel Uganda ile iletişime geçin:
   - Email: airtel.developer@airtel.co.ug
   - Website: https://www.airtel.ug/business

2. Gerekli belgeler:
   - ✅ Şirket Tescil Belgesi
   - ✅ TIN Sertifikası
   - ✅ Yönetici kimlik fotokopileri
   - ✅ İş planı/use case
   - ✅ Beklenen işlem hacmi (aylık)
   - ✅ Banka hesap bilgileri

#### 2. KYC & Compliance

Airtel compliance team:
- Şirket doğrulaması yapacak
- AML/CFT kontrolü yapacak
- İş amacını onaylayacak

#### 3. Production Credentials

Onay sonrası:
- Production Client ID
- Production Client Secret
- Whitelist için IP adresleri
- Callback URL kaydı

#### 4. .env Güncelleme

```env
AIRTEL_BASE_URL=https://openapi.airtel.africa
AIRTEL_CLIENT_ID=production_client_id
AIRTEL_CLIENT_SECRET=production_client_secret
```

---

## 💰 Ücretler & Limitler

### MTN MoMo Sandbox
- ✅ Ücretsiz
- ⚠️ Test verileri ile çalışır (gerçek para transferi yok)
- Limit: Genelde sınırsız test

### MTN MoMo Production
- 💵 İşlem başına ücret: ~150-500 UGX (hacme göre değişir)
- 📊 Günlük limit: Sözleşmeye göre belirlenir
- 💼 Minimum aylık işlem yok (genelde)

### Airtel Money Sandbox
- ✅ Ücretsiz
- ⚠️ Test ortamı

### Airtel Money Production
- 💵 İşlem başına ücret: ~150-500 UGX
- 📊 Günlük limit: Sözleşmeye göre
- 💼 Hacim bazlı indirimler mevcut

---

## ⚙️ Teknik Gereksinimler

### IP Whitelisting

MTN ve Airtel, production ortamında sunucu IP'nizi whitelist'e ekler:

1. Sabit (static) IP adresinizi öğrenin
2. MTN/Airtel'e bildirin
3. Test edin

### Callback/Webhook URL

Webhook URL'niz:
- ✅ HTTPS olmalı
- ✅ DNS kaydı olmalı (IP değil)
- ✅ 24/7 erişilebilir olmalı

Örnek:
```
https://pay.smsconstruction.ug/api/webhooks/mtn
https://pay.smsconstruction.ug/api/webhooks/airtel
```

### SSL Sertifikası

Production için HTTPS zorunlu:
- Let's Encrypt (ücretsiz) kullanabilirsiniz
- Veya ticari sertifika alabilirsiniz

---

## 🧪 Test Senaryoları

### MTN Sandbox Test

```javascript
// Test numarası
const testPhone = "0772123456"; // Sandbox'ta herhangi bir 077/078 numarası
const testAmount = 1000;

// Test transferi
await sendMtnPayout({
  phone: testPhone,
  amount: testAmount,
  externalId: "TEST-001"
});

// Beklenen sonuç: 202 Accepted veya success response
```

### Airtel Sandbox Test

```javascript
const testPhone = "0751234567"; // Sandbox'ta herhangi bir 075/070 numarası
const testAmount = 1000;

await sendAirtelPayout({
  phone: testPhone,
  amount: testAmount,
  externalId: "TEST-001"
});
```

---

## 📞 Destek & İletişim

### MTN Uganda
- Website: https://momodeveloper.mtn.com/
- Email: momo@mtn.co.ug
- Support Portal: https://momodeveloper.mtn.com/support
- Telefon: +256 312 100100

### Airtel Uganda
- Website: https://developers.airtel.africa/
- Email: airtel.developer@airtel.co.ug
- Business: https://www.airtel.ug/business

---

## ✅ Production Checklist

Canlıya geçmeden önce kontrol edin:

- [ ] MTN ve Airtel ile sözleşme imzalandı
- [ ] Production credentials alındı
- [ ] IP adresleri whitelist'e eklendi
- [ ] Webhook URL'leri kaydedildi
- [ ] SSL sertifikası kuruldu
- [ ] Database yedekleme sistemi hazır
- [ ] Monitoring/alerting ayarlandı
- [ ] Günlük reconciliation (mutabakat) süreci belirlendi
- [ ] Finans ekibi eğitildi
- [ ] Acil durum planı hazır
- [ ] Test ödemeleri yapıldı (küçük tutarlarla)

---

## 🚨 Önemli Notlar

1. **Sandbox ve Production Farklıdır**
   - Sandbox'ta çalışan herşey production'da da çalışmaz
   - Mutlaka production'da küçük testler yapın

2. **Webhook'lar Kritiktir**
   - Webhook'lar düşerse durum güncellemeleri alamazsınız
   - 24/7 çalışır durumda olmalı

3. **Reconciliation (Mutabakat)**
   - Her gün MTN/Airtel statement'larını indirin
   - Kendi veritabanınızla karşılaştırın
   - Uyuşmazlıkları takip edin

4. **Güvenlik**
   - API credentials'ları asla kod içine yazmayın
   - `.env` dosyasını git'e eklemeyin
   - Production şifrelerini güvenli saklayın

5. **Yedekleme**
   - Database'i günlük yedekleyin
   - Transaction loglarını saklayın
   - En az 6 ay geçmiş tutun
