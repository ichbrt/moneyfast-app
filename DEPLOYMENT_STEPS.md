# MoneyFast Uganda - Canlıya Alma (Deployment) Adımları

GitHub hesabınıza erişimim olmadığı için, kodları sizin yüklemeniz gerekiyor. İşlem çok basit, aşağıdakileri sırasıyla yapmanız yeterli.

## 1. Kodları GitHub'a Yükleyin (GitHub Desktop İle)

Bilgisayarınızda "git" komutu terminalden çalışmadığı için, yüklü olan **GitHub Desktop** uygulamasını kullanın:

1.  **GitHub Desktop** uygulamasını açın.
2.  Sol tarafta değiştirdiğimiz dosyaları (örneğin `vercel.json`) göreceksiniz.
3.  Sol alttaki kutucuğa bir özet yazın (Örn: "Vercel 404 düzeltmesi").
4.  Mavi renkli **"Commit to main"** butonuna tıklayın.
5.  Yukarıdaki **"Push origin"** butonuna tıklayın.

Bunu yaptığınız an kodlar GitHub'a gider ve Vercel otomatik başlar.

## 2. Vercel Üzerinden Yayınlayın
1.  **[Vercel Paneline](https://vercel.com/dashboard)** gidin.
2.  **"Add New..."** butonuna tıklayın ve **"Project"** seçin.
3.  GitHub listenizden `bulk-payment-system` (veya projenizin adı neyse) onu seçip **Import** deyin.
4.  Vercel ayarları otomatik algılayacak (`vercel.json` dosyasını hazırladım). Sadece **"Deploy"** butonuna basın.

## 3. Domain Bağlayın (dslns.com)
1.  Deploy işlemi bitince, Vercel'de projenizin **Settings** -> **Domains** kısmına gidin.
2.  `dslns.com` yazıp ekleyin.
3.  Vercel size bazı DNS kayıtları (A kaydı veya CNAME) verecek.
4.  Domaini aldığınız firmanın paneline gidip bu kayıtları girin.

✅ **Tebrikler! Siteniz artık dslns.com adresinde yayında.**
