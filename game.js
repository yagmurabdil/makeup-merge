// =============================================
// MAKYAJ BİRLEŞTİRME OYUNU
// HTML5 Canvas + JavaScript
// =============================================

// HTML tarafındaki canvas elemanı alınarak oyunun çizim alanı belirlenir.
const tuval = document.getElementById("gameCanvas");
// Canvas üzerinde iki boyutlu çizim yapabilmek için 2D bağlam oluşturulur.
const cizim = tuval.getContext("2d");

// =============================================
// SES DOSYALARI
// =============================================

// Oyun boyunca çalacak arka plan müziği tanımlanır.
const arkaPlanMuzigi = new Audio("sounds/bgmusic.mp3");
// Aynı seviyedeki ürünler birleştiğinde çalacak ses efekti tanımlanır.
const birlesmeSesi = new Audio("sounds/mergemusic.mp3");
// Golden Boost özel ürünü kullanıldığında çalacak ses efekti tanımlanır.
const altinUrunSesi = new Audio("sounds/golden_boost.mp3");
// Oyuncu kaybettiğinde çalacak Game Over sesi tanımlanır.
const oyunBittiSesi = new Audio("sounds/gameovermusic.mp3");
// En üst ürün oluşturulduğunda çalacak tamamlama sesi tanımlanır.
const tamamlandiSesi = new Audio("sounds/game_complete.mp3");

// Arka plan müziğinin oyun süresince tekrar etmesi sağlanır.
arkaPlanMuzigi.loop = true;
// Arka plan müziğinin ses seviyesi oyun efektlerini bastırmayacak şekilde ayarlanır.
arkaPlanMuzigi.volume = 0.30;

// Birleşme sesinin duyulabilir fakat rahatsız etmeyecek seviyede olması sağlanır.
birlesmeSesi.volume = 0.65;
// Golden Boost sesinin diğer efektlerden biraz daha belirgin olması sağlanır.
altinUrunSesi.volume = 0.70;
// Oyun bitiş sesinin oyuncuya net şekilde geri bildirim vermesi sağlanır.
oyunBittiSesi.volume = 0.75;
// Oyun tamamlama sesinin kutlama etkisi oluşturacak seviyede olması sağlanır.
tamamlandiSesi.volume = 0.75;

// Ses efektlerini kontrollü şekilde oynatmak için ortak bir yardımcı fonksiyon kullanılır.
function sesCal(ses, maxSureMs = null) {
    // Sesin her tetiklenmede baştan başlaması sağlanır.
    ses.currentTime = 0;
    // Tarayıcı izinleri nedeniyle oluşabilecek ses oynatma hataları oyunu durdurmadan yakalanır.
    ses.play().catch(() => {});

    // Ses için süre sınırı verilmişse efekt belirli bir süre sonra durdurulur.
    if (maxSureMs) {
        // Belirlenen süre sonunda sesin durması için zamanlayıcı çalıştırılır.
        setTimeout(() => {
            // Süresi dolan ses efekti durdurulur.
            ses.pause();
            // Sesin her tetiklenmede baştan başlaması sağlanır.
            ses.currentTime = 0;
        }, maxSureMs);
    }
}

// Kullanıcı etkileşiminden sonra arka plan müziğini başlatan fonksiyondur.
function arkaPlanMuziginiBaslat() {
    // Müzik yalnızca oyun devam ediyorsa ve hâlihazırda çalmıyorsa başlatılır.
    if (arkaPlanMuzigi.paused && !oyunBittiMi && !oyunTamamlandiMi) {
        arkaPlanMuzigi.play().catch(() => {});
    }
}

// Tarayıcı ses politikaları nedeniyle ilk tıklamada müzik başlatılır.
window.addEventListener("click", arkaPlanMuziginiBaslat);
// Klavye etkileşimi de müziği başlatmak için geçerli kabul edilir.
window.addEventListener("keydown", arkaPlanMuziginiBaslat);

// =============================================
// GÖRSELLER
// =============================================

// Oyun arka planı için görsel nesnesi oluşturulur.
const arkaPlanGorseli = new Image();
// Arka plan görselinin dosya yolu atanır.
arkaPlanGorseli.src = "images/background.png";

// Oyun alanında kullanılacak makyaj çantası görseli oluşturulur.
const cantaGorseli = new Image();
// Çanta görselinin dosya yolu atanır.
cantaGorseli.src = "images/bag.png";

// Golden Boost ürünü için ayrı bir görsel nesnesi oluşturulur.
const altinUrunGorseli = new Image();
// Golden Boost görselinin dosya yolu atanır.
altinUrunGorseli.src = "images/golden_boost.png";

// =============================================
// TEMEL OYUN DEĞİŞKENLERİ
// =============================================

// Oyuncunun oyun boyunca kazandığı puanı tutar.
let skor = 0;
// Oyuncunun kullanabileceği başlangıç joker hakkı sayısıdır.
let jokerSayisi = 3;
// Oyunun kaybedilip kaybedilmediğini takip eden durum değişkenidir.
let oyunBittiMi = false;
// Oyunun başarıyla tamamlanıp tamamlanmadığını takip eder.
let oyunTamamlandiMi = false;
// Animasyon döngüsünde geçen kare sayısını tutar.
let kareSayisi = 0;

// Fizik ayarları
// Ürünlerin aşağı doğru düşmesini sağlayan yer çekimi değeri belirlenir.
const yerCekimi = 0.24;
// Ürünlerin aşırı hızlanmasını önlemek için maksimum düşme hızı sınırlandırılır.
const maksimumDusmeHizi = 6.2;
// Yatay hareketin zamanla yavaşlaması için sürtünme katsayısı kullanılır.
const surtunme = 0.78;
// Çok küçük hızlar sıfırlanarak ürünlerin sabitlenmesi kolaylaştırılır.
const durmaHizi = 0.10;

// ÜST ÜSTE DURMA İÇİN ÇARPIŞMA ALANI
// Görsellerin çarpışma alanı, daha doğal üst üste durma için ölçeklendirilir.
const fizikOlcegi = 0.86;

// Düzeltme ayarları
// Son ürün bırakma zamanı kare sayısı olarak saklanır.
let sonBirakmaKaresi = -999;

// Çarpışmaların daha kararlı çözülmesi için kontrol birkaç kez tekrarlanır.
const carpısmaCozumTekrari = 12;
// Yeni oluşan ürünlerin hemen birleşmesini engelleyen kısa bekleme süresidir.
const mergeBeklemeKaresi = 10;
// Taşma durumunun anlık hatayla değil, belirli süre sonunda Game Over üretmesini sağlar.
const gameOverBeklemeKaresi = 22;

// Oyun alanı
// Canvas içinde oyunun ana oynanabilir alanı tanımlanır.
const oyunAlani = {
    x: 10,
    y: 55,
    genislik: 850,
    yukseklik: 640
};

// Sağ panel
// Skor, joker ve sonraki ürün bilgilerinin yer aldığı sağ panel tanımlanır.
const sagPanel = {
    x: 870,
    y: 90,
    genislik: 220,
    yukseklik: 440
};

// Çanta
// Makyaj çantasının başlangıç konumu ve boyutu tanımlanır.
const canta = {
    x: 20,
    y: 55,
    genislik: 840,
    yukseklik: 660
};

// Yeni ürünlerin ekrana giriş yaptığı dikey konum belirlenir.
let urunBaslangicY = canta.y - 10;
// Çanta ağzına yakın Game Over kontrol çizgisi belirlenir.
let oyunBitisCizgisi = canta.y + 135;

// Ürünlerin çanta içinde kalması için sol iç sınır belirlenir.
let cantaSolIcSinir = canta.x + 150;
// Ürünlerin çanta içinde kalması için sağ iç sınır belirlenir.
let cantaSagIcSinir = canta.x + canta.genislik - 150;
// Ürünlerin duracağı çanta tabanı yüksekliği belirlenir.
let cantaTabani = canta.y + canta.yukseklik - 60;

// Aktif ürünün hareket edebileceği çanta ağzı sol sınırı tanımlanır.
let cantaAgziSol = canta.x + 205;
// Aktif ürünün hareket edebileceği çanta ağzı sağ sınırı tanımlanır.
let cantaAgziSag = canta.x + canta.genislik - 205;
// Çanta ağzının üst hizası çarpışma ve taşma kontrollerinde kullanılır.
let cantaAgziUst = canta.y + 185;

// =============================================
// ÜRÜN BİLGİLERİ
// =============================================

// Oyunda kullanılan ürünlerin seviye, görsel, boyut ve puan bilgileri sıralı olarak saklanır.
const urunBilgileri = [
    { ad: "blender", gorsel: "images/blender.png", yaricap: 30, puan: 5 },
    { ad: "moisturizer", gorsel: "images/moisturizer.png", yaricap: 34, puan: 10 },
    { ad: "gloss", gorsel: "images/gloss.png", yaricap: 38, puan: 20 },
    { ad: "lipstick", gorsel: "images/lipstick.png", yaricap: 43, puan: 40 },
    { ad: "mascara", gorsel: "images/mascara.png", yaricap: 48, puan: 80 },
    { ad: "blush", gorsel: "images/blush.png", yaricap: 54, puan: 120 },
    { ad: "brush", gorsel: "images/brush.png", yaricap: 60, puan: 180 },
    { ad: "brush_set", gorsel: "images/brush_set.png", yaricap: 66, puan: 260 },
    { ad: "eye_shadow", gorsel: "images/eye_shadow.png", yaricap: 74, puan: 360 },
    { ad: "eyeshadow_palette", gorsel: "images/eyeshadow_palette.png", yaricap: 82, puan: 500 },
    { ad: "miniperfume", gorsel: "images/miniperfume.png", yaricap: 90, puan: 700 },
    { ad: "perfume", gorsel: "images/perfume.png", yaricap: 102, puan: 1000 },
    { ad: "organizer", gorsel: "images/organizer.png", yaricap: 120, puan: 1500 },
    { ad: "makeupset", gorsel: "images/makeupset.png", yaricap: 170, puan: 0 }
];

// Her ürün için ilgili görsel dosyası önceden yüklenir.
urunBilgileri.forEach(urun => {
    // Ürünün canvas üzerinde çizilebilmesi için görsel nesnesi oluşturulur.
    urun.resim = new Image();
    // Ürünün görsel dosyası ilgili ürün bilgisine bağlanır.
    urun.resim.src = urun.gorsel;
});

// =============================================
// OYUNDAKİ NESNELER
// =============================================

// Çantaya bırakılmış ve fizik hesaplarına dahil edilen ürünleri tutar.
let urunler = [];
// Oyuncunun o anda kontrol ettiği ürünü temsil eder.
let aktifUrun = null;
// Sağ panelde gösterilen ve sırada bekleyen ürünü tutar.
let sonrakiUrun = null;
// Joker mekanizması için son bırakılan ürün takip edilir.
let sonBirakilanUrun = null;
// Oyun tamamlandığında çizilecek konfeti parçaları bu dizide tutulur.
let konfetiParcalari = [];
// Bir ürün düşerken yeni ürünün hemen gelmesini engelleyen kontrol değişkenidir.
let urunDusuyorMu = false;

// =============================================
// ÇANTA BOYUTU VE SINIRLARI
// =============================================

// Çanta görselinin gerçek oranına göre oyun içi çanta boyutları güncellenir.
function cantaBoyutunuGuncelle() {
    // Görsel yüklenmeden boyut hesabı yapılmaması için kontrol uygulanır.
    if (cantaGorseli.naturalWidth > 0 && cantaGorseli.naturalHeight > 0) {
        // Çanta görselinin en-boy oranı hesaplanır.
        const oran = cantaGorseli.naturalWidth / cantaGorseli.naturalHeight;

        // Çantanın hedef yüksekliği belirlenir.
        canta.yukseklik = 690;
        // En-boy oranı korunarak çanta genişliği hesaplanır.
        canta.genislik = canta.yukseklik * oran;

        // Çanta genişliği oyun alanını aşarsa boyut yeniden sınırlandırılır.
        if (canta.genislik > 850) {
            // Çantanın maksimum genişliği oyun alanına göre sabitlenir.
            canta.genislik = 850;
            // Genişlik sınırlandığında yükseklik oran korunarak yeniden hesaplanır.
            canta.yukseklik = canta.genislik / oran;
        }

        // Çanta dikey olarak canvas içinde uygun konuma yerleştirilir.
        canta.y = 85;
        // Çanta yatay eksende oyun alanının ortasına alınır.
        canta.x = oyunAlani.x + (oyunAlani.genislik - canta.genislik) / 2;

        // Ürün başlangıç yüksekliği çanta konumuna göre güncellenir.
        urunBaslangicY = canta.y - 10;

        // Çanta ağzının üst sınırı görsele uygun şekilde ayarlanır.
        cantaAgziUst = canta.y + 115;
        // Game Over sınırı çanta ağzı hizasına eşitlenir.
        oyunBitisCizgisi = cantaAgziUst;

        // Çanta ağzının sol hareket sınırı güncellenir.
        cantaAgziSol = canta.x + 205;
        // Çanta ağzının sağ hareket sınırı güncellenir.
        cantaAgziSag = canta.x + canta.genislik - 205;

        // Çanta içindeki fiziksel sol sınır güncellenir.
        cantaSolIcSinir = canta.x + 185;
        // Çanta içindeki fiziksel sağ sınır güncellenir.
        cantaSagIcSinir = canta.x + canta.genislik - 185;

        // Çanta tabanı görsel hizasına göre güncellenir.
        cantaTabani = canta.y + canta.yukseklik - 60;
    }
}

// =============================================
// YENİ ÜRÜN OLUŞTURMA
// =============================================

// Oyuna eklenecek yeni ürün nesnesini oluşturur.
function yeniUrunOlustur() {
    // Golden Boost oluşumu için rastgele değer üretilir.
    const altinUrunIhtimali = Math.random();

    // Belirlenen düşük olasılıkla özel Golden Boost ürünü oluşturulur.
    if (altinUrunIhtimali < 0.035) {
        return {
            x: canta.x + canta.genislik / 2,
            y: urunBaslangicY,
            hizX: 0,
            hizY: 0,
            yaricap: 42,
            seviye: -1,
            altinMi: true,
            resim: altinUrunGorseli,
            dogduguKare: kareSayisi,
            tasmaSayaci: 0,
            duruyorMu: false,
            birakildiMi: false,
            cantayaGirdiMi: false
        };
    }

    // Başlangıç ürünleri ilk dört seviye arasından rastgele seçilir.
    const seviye = Math.floor(Math.random() * 4);
    // Seçilen seviyeye ait ürün bilgileri alınır.
    const bilgi = urunBilgileri[seviye];

    return {
        x: canta.x + canta.genislik / 2,
        y: urunBaslangicY,
        hizX: 0,
        hizY: 0,
        yaricap: bilgi.yaricap,
        seviye: seviye,
        altinMi: false,
        resim: bilgi.resim,
        dogduguKare: kareSayisi,
        tasmaSayaci: 0,
        duruyorMu: false,
        birakildiMi: false,
        cantayaGirdiMi: false
    };
}

// Oyun başlangıcında aktif ve sonraki ürün hazırlanır.
function ilkUrunleriHazirla() {
    // Oyuncunun kontrol edeceği ilk ürün oluşturulur.
    aktifUrun = yeniUrunOlustur();
    // Aktif ürün değiştikten sonra yeni sıradaki ürün oluşturulur.
    sonrakiUrun = yeniUrunOlustur();
}

// Bırakılan ürün yerleştikten sonra sıradaki ürün aktif hale getirilir.
function sonrakiUruneGec() {
    // Sağ panelde bekleyen ürün artık kontrol edilebilir aktif ürün olur.
    aktifUrun = sonrakiUrun;

    aktifUrun.x = canta.x + canta.genislik / 2;
    aktifUrun.y = urunBaslangicY;
    aktifUrun.hizX = 0;
    aktifUrun.hizY = 0;
    aktifUrun.birakildiMi = false;
    aktifUrun.dogduguKare = kareSayisi;
    aktifUrun.tasmaSayaci = 0;
    aktifUrun.cantayaGirdiMi = false;

    // Aktif ürün değiştikten sonra yeni sıradaki ürün oluşturulur.
    sonrakiUrun = yeniUrunOlustur();
}

// =============================================
// OYUNU SIFIRLAMA
// =============================================

// Oyunu başlangıç değerlerine döndürerek yeniden başlatır.
function oyunuSifirla() {
    // Yeni oyun için skor sıfırlanır.
    skor = 0;
    // Joker hakkı başlangıç değerine döndürülür.
    jokerSayisi = 3;
    // Game Over durumu temizlenir.
    oyunBittiMi = false;
    // Tamamlama durumu temizlenir.
    oyunTamamlandiMi = false;
    // Animasyon kare sayacı başa alınır.
    kareSayisi = 0;
    sonBirakmaKaresi = -999;
    // Düşme süreci tamamlandığı için yeni ürün oluşturma izni verilir.
    urunDusuyorMu = false;

    // Önceki oyundan kalan ürünler temizlenir.
    urunler = [];
    // Önceki oyundan kalan konfeti parçaları temizlenir.
    konfetiParcalari = [];
    // Joker için takip edilen son ürün sıfırlanır.
    sonBirakilanUrun = null;

    // Başlangıçta aktif ve sonraki ürün oluşturulur.
    ilkUrunleriHazirla();

    // Arka plan müziği yeni oyunda baştan başlatılır.
    arkaPlanMuzigi.currentTime = 0;
    arkaPlanMuzigi.play().catch(() => {});
}

// =============================================
// KLAVYE KONTROLLERİ
// =============================================

// Klavye girişleri dinlenerek oyun kontrolleri uygulanır.
window.addEventListener("keydown", (e) => {
    // R tuşuna basıldığında oyun yeniden başlatılır.
    if (e.key.toLowerCase() === "r") {
        oyunuSifirla();
        return;
    }

    // Oyun bitmişse veya aktif ürün yoksa kontrol işlemi yapılmaz.
    if (oyunBittiMi || oyunTamamlandiMi || !aktifUrun) return;

    // Sol ok tuşu aktif ürünü sola taşır.
    if (e.key === "ArrowLeft") {
        // Aktif ürün yatay eksende sola hareket ettirilir.
        aktifUrun.x -= 14;
    }

    // Sağ ok tuşu aktif ürünü sağa taşır.
    if (e.key === "ArrowRight") {
        // Aktif ürün yatay eksende sağa hareket ettirilir.
        aktifUrun.x += 14;
    }

    // Aktif ürünün çanta ağzı sınırları dışına çıkması engellenir.
    aktifUrun.x = Math.max(
        cantaAgziSol + aktifUrun.yaricap,
        Math.min(cantaAgziSag - aktifUrun.yaricap, aktifUrun.x)
    );

    // Space veya aşağı ok tuşu ile ürün çantaya bırakılır.
    if ((e.code === "Space" || e.key === "ArrowDown") && !e.repeat) {
        // Aktif ürünün düşme süreci başlatılır.
        aktifUrunuBirak();
    }

    // J tuşuna basıldığında joker kullanma işlemi denenir.
    if (e.key.toLowerCase() === "j") {
        // Son bırakılan uygun ürün geri alınır.
        jokerKullan();
    }
});

// =============================================
// ÜRÜN BIRAKMA
// =============================================

// Oyuncunun kontrol ettiği ürünü fizik sistemine dahil eder.
function aktifUrunuBirak() {
    // Aktif ürün yoksa veya önceki ürün hâlâ düşüyorsa yeni bırakma yapılmaz.
    if (!aktifUrun || urunDusuyorMu) return;

    // Bırakılacak ürün ayrı bir değişkende tutulur.
    const birakilanUrun = aktifUrun;

    birakilanUrun.dogduguKare = kareSayisi;
    birakilanUrun.tasmaSayaci = 0;
    birakilanUrun.hizX = 0;
    // Ürüne çok küçük başlangıç düşme hızı verilir.
    birakilanUrun.hizY = 0.18;
    birakilanUrun.duruyorMu = false;
    // Ürünün artık oyuncu kontrolünden çıktığı işaretlenir.
    birakilanUrun.birakildiMi = true;
    birakilanUrun.cantayaGirdiMi = false;

    // Bırakılan ürün fizik hesaplarına katılmak üzere ürün listesine eklenir.
    urunler.push(birakilanUrun);
    // Joker kullanılabilmesi için son bırakılan ürün saklanır.
    sonBirakilanUrun = birakilanUrun;
    sonBirakmaKaresi = kareSayisi;

    // Oyuncunun kontrol ettiği aktif ürün boşaltılır.
    aktifUrun = null;
    // Yeni ürün gelmeden önce mevcut ürünün yerleşmesi beklenir.
    urunDusuyorMu = true;
}

// Joker hakkı varsa son bırakılan ürünü geri almaya çalışır.
function jokerKullan() {
    // Joker hakkı yoksa veya geri alınacak ürün bulunmuyorsa işlem yapılmaz.
    if (jokerSayisi <= 0 || !sonBirakilanUrun) return;

    // Son bırakılan ürünün oyun listesindeki yeri bulunur.
    const sira = urunler.indexOf(sonBirakilanUrun);

    // Ürün hâlâ oyun alanındaysa geri alma işlemi uygulanır.
    if (sira !== -1) {
        // Son bırakılan ürün oyun listesinden çıkarılır.
        urunler.splice(sira, 1);
        // Kullanılan joker hakkı bir azaltılır.
        jokerSayisi--;
    }

    // Joker için takip edilen son ürün sıfırlanır.
    sonBirakilanUrun = null;
}

// =============================================
// ÜRÜN ÇİZME
// =============================================

// Verilen ürünün görselini canvas üzerine çizer.
function urunCiz(urun) {
    // Ürüne özel çizim efektlerinden önce mevcut canvas ayarları saklanır.
    cizim.save();

    // Golden Boost ürünü için parlama efekti uygulanır.
    if (urun.altinMi) {
        // Parlama efekti altın rengiyle oluşturulur.
        cizim.shadowColor = "gold";
        // Golden Boost ürününün etrafına yumuşak ışık efekti verilir.
        cizim.shadowBlur = 25;
    }

    // Ürün görseli konumuna ve yarıçapına göre canvas üzerine çizilir.
    cizim.drawImage(
        urun.resim,
        urun.x - urun.yaricap,
        urun.y - urun.yaricap,
        urun.yaricap * 2,
        urun.yaricap * 2
    );

    // Çizim ayarları eski haline döndürülür.
    cizim.restore();
}

// =============================================
// ÜRÜNLERİ GÜNCELLEME
// =============================================

// Tüm ürünlerin hareket, hız ve sınır kontrollerini her karede günceller.
function urunleriGuncelle() {
    // Oyun alanındaki her ürün için fizik hesapları uygulanır.
    urunler.forEach(urun => {
        // Ürünün dikey hızına yer çekimi etkisi eklenir.
        urun.hizY += yerCekimi;
        // Dikey hız maksimum değeri aşarsa sınırlandırılır.
        if (urun.hizY > maksimumDusmeHizi) urun.hizY = maksimumDusmeHizi;

        // Yatay hız sürtünme etkisiyle azaltılır.
        urun.hizX *= surtunme;
        // Çok düşük yatay hızlar sıfırlanarak titreme azaltılır.
        if (Math.abs(urun.hizX) < durmaHizi) urun.hizX = 0;

        // Yatay hız aşırı büyürse ürünlerin kayması engellenir.
        if (Math.abs(urun.hizX) > 1.8) urun.hizX = Math.sign(urun.hizX) * 1.8;

        // Ürünün yatay konumu hızına göre güncellenir.
        urun.x += urun.hizX;
        // Ürünün dikey konumu hızına göre güncellenir.
        urun.y += urun.hizY;

        // Ürün çanta içine yeterince girdiyse taşma kontrolüne dahil edilir.
        if (urun.y + urun.yaricap > oyunBitisCizgisi + 20) {
            // Ürünün çanta alanına girdiği kaydedilir.
            urun.cantayaGirdiMi = true;
        }

        // Ürün çanta tabanına ulaştığında aşağı hareketi durdurulur.
        if (urun.y + urun.yaricap >= cantaTabani) {
            // Ürün taban çizgisinin üzerinde sabitlenir.
            urun.y = cantaTabani - urun.yaricap;
            // Tabanla temas eden ürünün dikey hızı sıfırlanır.
            urun.hizY = 0;
            // Tabana temas sonrası yatay kayma etkisi azaltılır.
            urun.hizX *= 0.3;
        }

        // Ürünün yüksekliğine bağlı olarak çanta duvar daralması hesaplanır.
        const duvarT = Math.max(0, Math.min(1,
            (urun.y - cantaAgziUst) / (cantaTabani - cantaAgziUst)
        ));

        // Çantanın alt kısımlarına doğru daralan iç sınır etkisi oluşturulur.
        const ekstraDaralma = duvarT * 90;
        // Ürünün bulunduğu yüksekliğe göre sol sınır hesaplanır.
        const dinamikSol = cantaSolIcSinir + ekstraDaralma;
        // Ürünün bulunduğu yüksekliğe göre sağ sınır hesaplanır.
        const dinamikSag = cantaSagIcSinir - ekstraDaralma;

        // Ürün sol iç sınırı aşarsa tekrar çanta içine alınır.
        if (urun.x - urun.yaricap < dinamikSol) {
            // Ürün sol sınırın içine sabitlenir.
            urun.x = dinamikSol + urun.yaricap;
            urun.hizX = 0;
        }

        // Ürün sağ iç sınırı aşarsa tekrar çanta içine alınır.
        if (urun.x + urun.yaricap > dinamikSag) {
            // Ürün sağ sınırın içine sabitlenir.
            urun.x = dinamikSag - urun.yaricap;
            urun.hizX = 0;
        }

        // Ürünün neredeyse hareketsiz olup olmadığı belirlenir.
        urun.duruyorMu = Math.abs(urun.hizX) < 0.10 && Math.abs(urun.hizY) < 0.10;
    });
}

// =============================================
// ÇARPIŞMA VE BİRLEŞME
// =============================================

// Ürünlerin birbirine temas etme, ayrılma ve birleşme durumlarını kontrol eder.
function carpismalariKontrolEt() {
    // Üst üste binmeleri azaltmak için çarpışma çözümü birkaç kez uygulanır.
    for (let tekrar = 0; tekrar < carpısmaCozumTekrari; tekrar++) {
        // İlk ürün seçimi için ürün listesi dolaşılır.
        for (let i = 0; i < urunler.length; i++) {
            // Her ürün, kendisinden sonraki ürünlerle karşılaştırılır.
            for (let j = i + 1; j < urunler.length; j++) {
                // Karşılaştırılacak birinci ürün alınır.
                const a = urunler[i];
                // Karşılaştırılacak ikinci ürün alınır.
                const b = urunler[j];

                // İki ürün arasındaki yatay mesafe farkı hesaplanır.
                const farkX = a.x - b.x;
                // İki ürün arasındaki dikey mesafe farkı hesaplanır.
                const farkY = a.y - b.y;

                // İki ürün arasındaki merkezler arası uzaklık hesaplanır.
                const mesafe = Math.sqrt(farkX * farkX + farkY * farkY) || 1;
                // Birinci ürünün fiziksel çarpışma yarıçapı belirlenir.
                const aFizik = a.yaricap * fizikOlcegi;
                // İkinci ürünün fiziksel çarpışma yarıçapı belirlenir.
                const bFizik = b.yaricap * fizikOlcegi;
                // İki ürünün çarpışmış kabul edilmesi için gereken minimum mesafe hesaplanır.
                const minimumMesafe = aFizik + bFizik;

                // Ürünler birbirine yeterince yaklaştıysa çarpışma veya birleşme değerlendirilir.
                if (mesafe < minimumMesafe) {
                    // Yeni bırakılan ürünlerin anlık temasla hatalı birleşmesini önlemek için yaş kontrolü yapılır.
                    const yeterinceEski =
                        kareSayisi - a.dogduguKare > mergeBeklemeKaresi &&
                        kareSayisi - b.dogduguKare > mergeBeklemeKaresi;

                    // Aynı seviyedeki iki standart ürünün birleşme şartları kontrol edilir.
                    const normalBirlesebilir =
                        yeterinceEski &&
                        a.seviye === b.seviye &&
                        !a.altinMi &&
                        !b.altinMi &&
                        a.seviye < urunBilgileri.length - 1;

                    // Golden Boost içeren temaslarda özel birleşme şartı kontrol edilir.
                    const altinBirlesebilir =
                        yeterinceEski &&
                        (a.altinMi || b.altinMi);

                    // Normal birleşme şartları sağlanıyorsa üst seviye ürün oluşturulur.
                    if (normalBirlesebilir) {
                        // İki standart ürün bir üst seviyedeki ürüne dönüştürülür.
                        normalBirlesmeYap(a, b, i, j);
                        return;
                    }

                    // Golden Boost şartı sağlanıyorsa özel birleşme uygulanır.
                    if (altinBirlesebilir) {
                        // Golden Boost ile temas eden ürün bir üst seviyeye yükseltilir.
                        altinUrunBirlesmesiYap(a, b, i, j);
                        return;
                    }

                    // Birleşmeyen ürünlerin iç içe geçmesi fiziksel olarak düzeltilir.
                    urunleriAyir(a, b, mesafe, farkX, farkY);
                }
            }
        }
    }
}

// Aynı seviyedeki iki standart ürünün birleşmesini gerçekleştirir.
function normalBirlesmeYap(a, b, i, j) {
    // Birleşme sonucunda oluşacak ürün seviyesi hesaplanır.
    const yeniSeviye = a.seviye + 1;
    // Yeni seviyeye ait ürün bilgileri alınır.
    const bilgi = urunBilgileri[yeniSeviye];

    // Birleşme sonucu oyuncunun skoru artırılır.
    skor += bilgi.puan;
    // Normal birleşme sesi kısa süreli olarak çalınır.
    sesCal(birlesmeSesi, 450);

    // Birleşme sonucunda oluşacak yeni ürün nesnesi hazırlanır.
    const yeniUrun = {
        x: (a.x + b.x) / 2,
        y: Math.min((a.y + b.y) / 2, cantaTabani - bilgi.yaricap),
        hizX: 0,
        hizY: 0.25,
        yaricap: bilgi.yaricap,
        seviye: yeniSeviye,
        altinMi: false,
        resim: bilgi.resim,
        dogduguKare: kareSayisi,
        tasmaSayaci: 0,
        duruyorMu: false,
        birakildiMi: true,
        cantayaGirdiMi: true
    };

    // Birleşen ürünlerden ikincisi listeden çıkarılır.
    urunler.splice(j, 1);
    // Birleşen ürünlerden birincisi listeden çıkarılır.
    urunler.splice(i, 1);
    // Oluşan üst seviye ürün oyun alanına eklenir.
    urunler.push(yeniUrun);

    // Yeni oluşan ürün son işlem gören ürün olarak kaydedilir.
    sonBirakilanUrun = yeniUrun;

    // En son seviye ürüne ulaşıldığında oyun tamamlanır.
    if (bilgi.ad === "makeupset") {
        // Oyun başarı ekranı ve kutlama efektleri başlatılır.
        oyunuTamamla();
    }
}

// Golden Boost özel ürününün birleşme davranışını uygular.
function altinUrunBirlesmesiYap(a, b, i, j) {
    // Golden Boost ile temas eden standart ürün belirlenir.
    const normalUrun = a.altinMi ? b : a;

    // Geçersiz seviye durumlarında birleşme yerine fiziksel ayrıştırma yapılır.
    if (normalUrun.seviye < 0 || normalUrun.seviye >= urunBilgileri.length - 1) {
        urunleriAyir(a, b, 1, a.x - b.x, a.y - b.y);
        return;
    }

    // Golden Boost, temas ettiği ürünü bir üst seviyeye taşır.
    const yeniSeviye = normalUrun.seviye + 1;
    // Yeni seviyeye ait ürün bilgileri alınır.
    const bilgi = urunBilgileri[yeniSeviye];

    // Golden Boost kullanımı için ek puan verilir.
    skor += 100;
    // Golden Boost özel ses efekti çalınır.
    sesCal(altinUrunSesi);

    // Birleşme sonucunda oluşacak yeni ürün nesnesi hazırlanır.
    const yeniUrun = {
        x: normalUrun.x,
        y: Math.min(normalUrun.y, cantaTabani - bilgi.yaricap),
        hizX: 0,
        hizY: 0.25,
        yaricap: bilgi.yaricap,
        seviye: yeniSeviye,
        altinMi: false,
        resim: bilgi.resim,
        dogduguKare: kareSayisi,
        tasmaSayaci: 0,
        duruyorMu: false,
        birakildiMi: true,
        cantayaGirdiMi: true
    };

    // Birleşen ürünlerden ikincisi listeden çıkarılır.
    urunler.splice(j, 1);
    // Birleşen ürünlerden birincisi listeden çıkarılır.
    urunler.splice(i, 1);
    // Oluşan üst seviye ürün oyun alanına eklenir.
    urunler.push(yeniUrun);

    // Yeni oluşan ürün son işlem gören ürün olarak kaydedilir.
    sonBirakilanUrun = yeniUrun;

    // En son seviye ürüne ulaşıldığında oyun tamamlanır.
    if (bilgi.ad === "makeupset") {
        // Oyun başarı ekranı ve kutlama efektleri başlatılır.
        oyunuTamamla();
    }
}

// Birleşmeyen ancak çarpışan ürünleri birbirinden ayırır.
function urunleriAyir(a, b, mesafe, farkX, farkY) {
    // Ürün merkezleri aynı noktadaysa matematiksel hata oluşmaması için küçük fark verilir.
    if (!farkX && !farkY) {
        // Yatay yönde çok küçük bir ayrım değeri atanır.
        farkX = 0.01;
        // Dikey yönde varsayılan ayrım yönü oluşturulur.
        farkY = 1;
        mesafe = 1;
    }

    // Birinci ürünün fiziksel çarpışma yarıçapı belirlenir.
    const aFizik = a.yaricap * fizikOlcegi;
    // İkinci ürünün fiziksel çarpışma yarıçapı belirlenir.
    const bFizik = b.yaricap * fizikOlcegi;
    // İki ürünün çarpışmış kabul edilmesi için gereken minimum mesafe hesaplanır.
    const minimumMesafe = aFizik + bFizik;
    // Ürünlerin birbirinin içine ne kadar girdiği hesaplanır.
    const cakismaMiktari = minimumMesafe - mesafe;

    // Gerçek çakışma yoksa ayrıştırma yapılmaz.
    if (cakismaMiktari <= 0) return;

    // Ayrıştırma işleminin yatay yönü hesaplanır.
    const yonX = farkX / mesafe;
    // Ayrıştırma işleminin dikey yönü hesaplanır.
    const yonY = farkY / mesafe;

    // Üst üste durma düzeltmesi
    // Birinci ürünün ikinci ürüne göre daha aşağıda olup olmadığı belirlenir.
    const aAltta = a.y > b.y;
    // İkinci ürünün birinci ürüne göre daha aşağıda olup olmadığı belirlenir.
    const bAltta = b.y > a.y;
    // Birinci ürünün destek/zemin etkisiyle daha sabit kabul edilip edilmeyeceği belirlenir.
    const aDestek = aAltta || a.duruyorMu || a.y + a.yaricap >= cantaTabani - 2;
    // İkinci ürünün destek/zemin etkisiyle daha sabit kabul edilip edilmeyeceği belirlenir.
    const bDestek = bAltta || b.duruyorMu || b.y + b.yaricap >= cantaTabani - 2;

    // Ürünleri ayırmak için uygulanacak itme miktarı hesaplanır.
    const itme = cakismaMiktari * 0.72;

    // Destek durumuna göre dikey hızlar dengelenir.
    if (aDestek && !bDestek) {
        b.x -= yonX * itme;
        b.y -= yonY * itme;
    // İkinci ürün sabitse daha çok birinci ürün hareket ettirilir.
    } else if (bDestek && !aDestek) {
        a.x += yonX * itme;
        a.y += yonY * itme;
    // İki ürün de benzer durumda ise ayrıştırma iki ürüne paylaştırılır.
    } else {
        a.x += yonX * itme * 0.5;
        b.x -= yonX * itme * 0.5;
        a.y += yonY * itme * 0.5;
        b.y -= yonY * itme * 0.5;
    }

    // Ayrıştırmadan sonra birinci ürünün yatay hızı büyük ölçüde azaltılır.
    a.hizX *= 0.02;
    // Ayrıştırmadan sonra ikinci ürünün yatay hızı büyük ölçüde azaltılır.
    b.hizX *= 0.02;
    // Çok küçük yatay hızlar titremeyi önlemek için sıfırlanır.
    if (Math.abs(a.hizX) < 0.12) a.hizX = 0;
    // İkinci ürünün küçük yatay hızı sıfırlanır.
    if (Math.abs(b.hizX) < 0.12) b.hizX = 0;

    // Destek durumuna göre dikey hızlar dengelenir.
    if (aDestek && !bDestek) {
        // Destekli ürünün dikey hareketi durdurulur.
        a.hizY = 0;
        // Desteksiz ürünün dikey hareketi yumuşatılır.
        b.hizY = Math.max(0, b.hizY * 0.18);
    // İkinci ürün sabitse daha çok birinci ürün hareket ettirilir.
    } else if (bDestek && !aDestek) {
        // Destekli ikinci ürünün dikey hareketi durdurulur.
        b.hizY = 0;
        // Desteksiz birinci ürünün dikey hareketi yumuşatılır.
        a.hizY = Math.max(0, a.hizY * 0.18);
    // İki ürün de benzer durumda ise ayrıştırma iki ürüne paylaştırılır.
    } else {
        // Dengeli çarpışmada birinci ürünün dikey hızı azaltılır.
        a.hizY *= 0.35;
        // Dengeli çarpışmada ikinci ürünün dikey hızı azaltılır.
        b.hizY *= 0.35;
    }

    // Çok küçük dikey hızlar sıfırlanarak ürünlerin sabit durması sağlanır.
    if (Math.abs(a.hizY) < 0.14) a.hizY = 0;
    // İkinci ürünün küçük dikey hızı da sıfırlanır.
    if (Math.abs(b.hizY) < 0.14) b.hizY = 0;

    // Ayrıştırma sonrası birinci ürün çanta sınırlarına sabitlenir.
    urunuCantayaSabitle(a);
    // Ayrıştırma sonrası ikinci ürün çanta sınırlarına sabitlenir.
    urunuCantayaSabitle(b);
}

// Verilen ürünü çantanın dinamik iç sınırları içinde tutar.
function urunuCantayaSabitle(urun) {
    // Ürünün yüksekliğine bağlı olarak çanta duvar daralması hesaplanır.
    const duvarT = Math.max(0, Math.min(1,
        (urun.y - cantaAgziUst) / Math.max(1, cantaTabani - cantaAgziUst)
    ));
    // Çanta yapısına uygun daha yumuşak iç daralma değeri hesaplanır.
    const ekstraDaralma = duvarT * 60;
    // Ürünün bulunduğu yüksekliğe göre sol sınır hesaplanır.
    const dinamikSol = cantaSolIcSinir + ekstraDaralma;
    // Ürünün bulunduğu yüksekliğe göre sağ sınır hesaplanır.
    const dinamikSag = cantaSagIcSinir - ekstraDaralma;

    // Ürün sol iç sınırı aşarsa tekrar çanta içine alınır.
    if (urun.x - urun.yaricap < dinamikSol) {
        // Ürün sol sınırın içine sabitlenir.
        urun.x = dinamikSol + urun.yaricap;
        urun.hizX = 0;
    }

    // Ürün sağ iç sınırı aşarsa tekrar çanta içine alınır.
    if (urun.x + urun.yaricap > dinamikSag) {
        // Ürün sağ sınırın içine sabitlenir.
        urun.x = dinamikSag - urun.yaricap;
        urun.hizX = 0;
    }

    if (urun.y + urun.yaricap > cantaTabani) {
        // Ürün taban çizgisinin üzerinde sabitlenir.
        urun.y = cantaTabani - urun.yaricap;
        // Tabanla temas eden ürünün dikey hızı sıfırlanır.
        urun.hizY = 0;
    }
}

// =============================================
// GAME OVER KONTROLÜ
// =============================================

// Ürünlerin çanta ağzını aşıp aşmadığını kontrol ederek Game Over durumunu belirler.
function oyunBittiMiKontrolEt() {
    // Oyun alanındaki her ürün için fizik hesapları uygulanır.
    urunler.forEach(urun => {
        // Yeni oluşan ürünlerin hemen Game Over tetiklemesi engellenir.
        const yeterinceEski = kareSayisi - urun.dogduguKare > 50;

        // Taşma kontrolü için ürünün hareketinin büyük ölçüde durmuş olması beklenir.
        const urunDuruyorMu =
            Math.abs(urun.hizX) < 0.15 &&
            Math.abs(urun.hizY) < 0.15;

        // Ürünün çanta ağzı hizasının üstüne taşıp taşmadığı kontrol edilir.
        const cantaAgzindanTastiMi =
            urun.y - urun.yaricap < oyunBitisCizgisi;

        if (
            urun.cantayaGirdiMi &&
            yeterinceEski &&
            urunDuruyorMu &&
            cantaAgzindanTastiMi
        ) {
            // Ürün taşma halinde kaldıkça sayaç artırılır.
            urun.tasmaSayaci++;
        // İki ürün de benzer durumda ise ayrıştırma iki ürüne paylaştırılır.
        } else {
            // Taşma şartları sağlanmıyorsa sayaç sıfırlanır.
            urun.tasmaSayaci = 0;
        }

        // Taşma yeterli süre devam ederse oyun kaybedilmiş kabul edilir.
        if (urun.tasmaSayaci > gameOverBeklemeKaresi && !oyunBittiMi) {
            // Game Over durumu aktif hale getirilir.
            oyunBittiMi = true;
            // Oyun bitince arka plan müziği durdurulur.
            arkaPlanMuzigi.pause();
            // Game Over ses efekti çalınır.
            sesCal(oyunBittiSesi);
        }
    });
}

// =============================================
// OYUN TAMAMLAMA
// =============================================

// Oyuncu en üst seviye ürünü oluşturduğunda oyunu tamamlar.
function oyunuTamamla() {
    // Tamamlama durumu aktif edilir.
    oyunTamamlandiMi = true;
    // Oyun bitince arka plan müziği durdurulur.
    arkaPlanMuzigi.pause();
    // Tamamlama ses efekti çalınır.
    sesCal(tamamlandiSesi);
    // Başarı durumunda konfeti animasyonu hazırlanır.
    konfetiOlustur();
}

// Oyun tamamlandığında ekrana dağılacak konfeti parçalarını oluşturur.
function konfetiOlustur() {
    // Görsel olarak dolgun bir kutlama efekti için çok sayıda konfeti üretilir.
    for (let i = 0; i < 160; i++) {
        // Yeni konfeti parçası listeye eklenir.
        konfetiParcalari.push({
            x: oyunAlani.x + oyunAlani.genislik / 2,
            y: 120,
            hizX: (Math.random() - 0.5) * 12,
            hizY: Math.random() * -10,
            boyut: Math.random() * 8 + 4,
            renk: ["#ff69b4", "#ffd700", "#ffb6d9", "#ffffff"][Math.floor(Math.random() * 4)]
        });
    }
}

// Konfeti parçalarının konumlarını ve düşme hareketini günceller.
function konfetileriGuncelle() {
    konfetiParcalari.forEach(parca => {
        // Konfeti parçasının yatay konumu güncellenir.
        parca.x += parca.hizX;
        // Konfeti parçasının dikey konumu güncellenir.
        parca.y += parca.hizY;
        // Konfetilere aşağı doğru hafif yer çekimi etkisi verilir.
        parca.hizY += 0.2;
    });
}

// Konfeti parçalarını canvas üzerine çizer.
function konfetileriCiz() {
    konfetiParcalari.forEach(parca => {
        // Her konfeti parçası kendi rengine göre çizilir.
        cizim.fillStyle = parca.renk;
        // Konfeti parçası küçük kare olarak çizilir.
        cizim.fillRect(parca.x, parca.y, parca.boyut, parca.boyut);
    });
}

// =============================================
// SAĞ PANEL
// =============================================

// Skor, joker ve sonraki ürün bilgilerinin bulunduğu sağ paneli çizer.
function sagPaneliCiz() {
    // Ürüne özel çizim efektlerinden önce mevcut canvas ayarları saklanır.
    cizim.save();

    cizim.fillStyle = "rgba(255, 235, 246, 0.94)";
    // Sağ panel kenarlığı pembe tema ile uyumlu olacak şekilde ayarlanır.
    cizim.strokeStyle = "#ff86bd";
    // Panel kenarlığının kalınlığı belirlenir.
    cizim.lineWidth = 4;

    yuvarlakDikdortgenCiz(
        sagPanel.x,
        sagPanel.y,
        sagPanel.genislik,
        sagPanel.yukseklik,
        24,
        true,
        true
    );

    // Sağ panelde skor kutusu çizilir.
    bilgiKutusuCiz(sagPanel.x + 20, sagPanel.y + 25, "SKOR", skor);
    // Sağ panelde kalan joker hakkı gösterilir.
    bilgiKutusuCiz(sagPanel.x + 20, sagPanel.y + 140, "JOKER", jokerSayisi);

    cizim.fillStyle = "#c2185b";
    cizim.font = "bold 19px Arial";
    cizim.textAlign = "center";
    // Sonraki ürün alanının başlığı yazdırılır.
    cizim.fillText("SONRAKİ ÜRÜN", sagPanel.x + sagPanel.genislik / 2, sagPanel.y + 286);

    // Sıradaki ürün varsa panelde küçük önizleme olarak çizilir.
    if (sonrakiUrun) {
        urunCiz({
            x: sagPanel.x + sagPanel.genislik / 2,
            y: sagPanel.y + 342,
            yaricap: sonrakiUrun.altinMi ? 34 : Math.min(38, sonrakiUrun.yaricap),
            resim: sonrakiUrun.resim,
            altinMi: sonrakiUrun.altinMi
        });
    }

    cizim.font = "bold 17px Arial";
    // Oyuncuya joker kısayolu hatırlatılır.
    cizim.fillText("J TUŞU: JOKER", sagPanel.x + sagPanel.genislik / 2, sagPanel.y + 420);

    // Çizim ayarları eski haline döndürülür.
    cizim.restore();
}

// Panel içerisindeki skor ve joker bilgi kutularını çizer.
function bilgiKutusuCiz(x, y, baslik, deger) {
    cizim.fillStyle = "rgba(255, 255, 255, 0.78)";

    yuvarlakDikdortgenCiz(
        x,
        y,
        sagPanel.genislik - 40,
        88,
        18,
        true,
        false
    );

    cizim.fillStyle = "#c2185b";
    cizim.font = "bold 20px Arial";
    cizim.textAlign = "center";
    cizim.fillText(baslik, x + 95, y + 29);

    cizim.font = "bold 35px Arial";
    cizim.fillText(deger, x + 95, y + 68);
}

// Yuvarlatılmış köşeli dikdörtgen çizmek için yardımcı fonksiyondur.
function yuvarlakDikdortgenCiz(x, y, genislik, yukseklik, yaricap, dolguVarMi, kenarlikVarMi) {
    // Yeni bir çizim yolu başlatılır.
    cizim.beginPath();
    cizim.moveTo(x + yaricap, y);
    cizim.lineTo(x + genislik - yaricap, y);
    cizim.quadraticCurveTo(x + genislik, y, x + genislik, y + yaricap);
    cizim.lineTo(x + genislik, y + yukseklik - yaricap);
    cizim.quadraticCurveTo(x + genislik, y + yukseklik, x + genislik - yaricap, y + yukseklik);
    cizim.lineTo(x + yaricap, y + yukseklik);
    cizim.quadraticCurveTo(x, y + yukseklik, x, y + yukseklik - yaricap);
    cizim.lineTo(x, y + yaricap);
    cizim.quadraticCurveTo(x, y, x + yaricap, y);
    // Yuvarlatılmış dikdörtgen çizim yolu kapatılır.
    cizim.closePath();

    // Dolgu isteniyorsa şeklin içi boyanır.
    if (dolguVarMi) cizim.fill();
    // Kenarlık isteniyorsa şeklin dış çizgisi çizilir.
    if (kenarlikVarMi) cizim.stroke();
}

// =============================================
// ANA EKRAN ÇİZİMİ
// =============================================

// Her animasyon karesinde oyun ekranını baştan çizer.
function ekraniCiz() {
    // Önceki kare temizlenerek yeni çizim için boş alan hazırlanır.
    cizim.clearRect(0, 0, tuval.width, tuval.height);

    // Arka plan görseli canvas boyutuna yayılır.
    cizim.drawImage(arkaPlanGorseli, 0, 0, tuval.width, tuval.height);

    // Arka plana tema rengini güçlendiren yarı saydam pembe katman uygulanır.
    cizim.fillStyle = "rgba(255, 205, 230, 0.22)";
    // Yarı saydam renk katmanı tüm canvas üzerine çizilir.
    cizim.fillRect(0, 0, tuval.width, tuval.height);

    cizim.fillStyle = "#ff4f93";
    cizim.font = "bold 42px Arial";
    cizim.textAlign = "center";
    // Oyun başlığı üst bölüme yazdırılır.
    cizim.fillText("MAKEUP MERGE", oyunAlani.x + oyunAlani.genislik / 2, 50);

    // Makyaj çantası görseli hesaplanan konum ve boyutta çizilir.
    cizim.drawImage(cantaGorseli, canta.x, canta.y, canta.genislik, canta.yukseklik);

    // Oyun alanına bırakılmış tüm ürünler çizilir.
    urunler.forEach(urunCiz);

    // Oyun devam ediyorsa aktif ürün çanta ağzında gösterilir.
    if (!oyunBittiMi && !oyunTamamlandiMi && aktifUrun) {
        aktifUrun.y = urunBaslangicY;
        aktifUrun.hizX = 0;
        aktifUrun.hizY = 0;

        // Aktif ürünün çanta ağzı sınırları dışına çıkması engellenir.
        aktifUrun.x = Math.max(
            cantaAgziSol + aktifUrun.yaricap,
            Math.min(cantaAgziSag - aktifUrun.yaricap, aktifUrun.x)
        );

        urunCiz(aktifUrun);
    }

    // Sağdaki bilgi paneli ekrana çizilir.
    sagPaneliCiz();

    // Oyun tamamlandıysa başarı ekranı ve konfeti gösterilir.
    if (oyunTamamlandiMi) {
        konfetileriGuncelle();
        konfetileriCiz();

        cizim.fillStyle = "rgba(255,255,255,0.92)";
        yuvarlakDikdortgenCiz(110, 235, 690, 180, 24, true, false);

        cizim.fillStyle = "#ff4f93";
        cizim.font = "bold 34px Arial";
        cizim.textAlign = "center";
        cizim.fillText("MAKYAJ KOLEKSİYONU TAMAMLANDI!", 455, 315);

        cizim.font = "bold 26px Arial";
        cizim.fillText(`SKOR: ${skor}`, 455, 365);
    }

    // Oyun kaybedildiyse Game Over ekranı çizilir.
    if (oyunBittiMi) {
        cizim.fillStyle = "rgba(0,0,0,0.62)";
        // Yarı saydam renk katmanı tüm canvas üzerine çizilir.
        cizim.fillRect(0, 0, tuval.width, tuval.height);

        cizim.fillStyle = "white";
        cizim.font = "bold 58px Arial";
        cizim.textAlign = "center";
        // Game Over başlığı ekranın ortasına yazdırılır.
        cizim.fillText("GAME OVER", tuval.width / 2, 300);

        cizim.font = "bold 28px Arial";
        cizim.fillText(`SKOR: ${skor}`, tuval.width / 2, 360);
        cizim.fillText("R tuşu ile yeniden başlat", tuval.width / 2, 410);
    }
}

// =============================================
// ANA OYUN DÖNGÜSÜ
// =============================================

// Oyunun sürekli çalışan ana animasyon ve güncelleme döngüsüdür.
function oyunDongusu() {
    // Her döngüde kare sayısı bir artırılır.
    kareSayisi++;

    // Oyun başlamadan önce çanta sınırları ilk kez hesaplanır.
    cantaBoyutunuGuncelle();

    // Oyun aktif durumdaysa fizik, çarpışma ve bitiş kontrolleri yapılır.
    if (!oyunBittiMi && !oyunTamamlandiMi) {
        // Ürünlerin hareketleri ve sınır kontrolleri güncellenir.
        urunleriGuncelle();
        // Ürünler arası çarpışma ve birleşme kontrolleri yapılır.
        carpismalariKontrolEt();
        // Ürünler arası çarpışma ve birleşme kontrolleri yapılır.
        carpismalariKontrolEt();
        // Game Over koşulları değerlendirilir.
        oyunBittiMiKontrolEt();

        // Bırakılan ürünün yerleşip yerleşmediği kontrol edilir.
        if (urunDusuyorMu) {
            // Son bırakılan ürünün hâlâ oyun listesinde olup olmadığı kontrol edilir.
            const sonUrunHalaOyunda = sonBirakilanUrun && urunler.includes(sonBirakilanUrun);

            // Son ürün çantaya girdi ve yeterince yavaşladıysa yerleşmiş kabul edilir.
            const sonUrunYerlestiMi =
                sonUrunHalaOyunda &&
                sonBirakilanUrun.cantayaGirdiMi &&
                Math.abs(sonBirakilanUrun.hizX) < 0.24 &&
                Math.abs(sonBirakilanUrun.hizY) < 0.24;

            // Son ürün birleşme sonucu listeden silindiyse yeni ürüne geçilebilir.
            const urunYokOldu = sonBirakilanUrun && !sonUrunHalaOyunda;

            // Yeni ürünün daha erken gelmesi için 180'den 115'e indirildi
            // Ürün çok uzun süre yerleşmezse oyun akışının beklememesi için zaman aşımı uygulanır.
            const zamanAsimi = kareSayisi - sonBirakmaKaresi > 115;

            // Ürün yerleştiğinde, birleştiğinde veya zaman aşımı olduğunda sıradaki ürüne geçilir.
            if (sonUrunYerlestiMi || urunYokOldu || zamanAsimi) {
                // Düşme süreci tamamlandığı için yeni ürün oluşturma izni verilir.
                urunDusuyorMu = false;
                // Sıradaki ürün aktif ürün olarak oyuna alınır.
                sonrakiUruneGec();
            }
        }
    }

    // Güncel oyun durumu ekrana çizilir.
    ekraniCiz();

    // Tarayıcının animasyon döngüsüyle bir sonraki kare çağrılır.
    requestAnimationFrame(oyunDongusu);
}

// =============================================
// OYUNU BAŞLAT
// =============================================

// Oyun başlamadan önce çanta sınırları ilk kez hesaplanır.
cantaBoyutunuGuncelle();
// Başlangıçta aktif ve sonraki ürün oluşturulur.
ilkUrunleriHazirla();
// Ana oyun döngüsü başlatılır.
oyunDongusu();
