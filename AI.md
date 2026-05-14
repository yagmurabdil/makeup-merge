# AI Kullanım Dokümantasyonu

## Genel Açıklama

Bu proje geliştirme sürecinde yapay zeka araçları olarak ChatGPT ve Claude’dan teknik danışmanlık, hata ayıklama desteği, oyun mekaniği iyileştirmeleri, kod düzenleme desteği ve proje dokümantasyonunun hazırlanması konularında yararlanılmıştır.

Yapay zeka araçları proje geliştirme sürecinde yardımcı araç olarak kullanılmış; oyunun temel tasarımı, oyun mekaniklerinin uygulanması, görsel entegrasyonlar, test süreçleri ve nihai düzenlemeler proje ekibi tarafından gerçekleştirilmiştir.

Proje geliştirme sürecinde tekrar eden veya benzer teknik konular bir araya getirilerek özet biçimde dokümante edilmiştir.

Aşağıda proje geliştirme sürecinde yapay zeka araçlarına yöneltilen sorular ve alınan teknik yönlendirmeler yer almaktadır.

---

## Prompt 1

**Soru:**  
Merge oyununda fiziksel çarpışma sisteminin daha stabil çalışması için nasıl bir yaklaşım izlenmelidir? Objelerin üst üste düzgün yerleşmesi, havada asılı kalmaması ve fiziksel kaymaların azaltılması için hangi iyileştirmeler önerilir?

**Alınan Yanıt Özeti:**  
Çarpışma algılama sisteminin optimize edilmesi, nesneler arası çakışmaların doğru şekilde çözülmesi ve fizik parametrelerinin yeniden düzenlenmesi önerilmiştir.

---

## Prompt 2

**Soru:**  
Mevcut JavaScript oyun kodunda fiziksel davranışları iyileştirmek ve belirli mekaniklerdeki hataları gidermek amacıyla kod yapısında nasıl düzenlemeler yapılabilir?

**Alınan Yanıt Özeti:**  
Kod organizasyonunun sadeleştirilmesi, fiziksel hareket hesaplarının yeniden yapılandırılması ve belirli hata oluşturan mantıksal blokların düzenlenmesi konusunda kod düzeyinde teknik destek sağlanmıştır.

---

## Prompt 3

**Soru:**  
Canvas tabanlı oyun yapısında objelerin oyun alanı sınırlarının dışına taşmasını önlemek için boundary kontrol sistemi nasıl daha güvenilir hale getirilebilir?

**Alınan Yanıt Özeti:**  
Oyun alanı sınırlarının sürekli kontrol edilmesi, objelerin belirlenen alan dışına çıkmasının engellenmesi ve fizik hesaplamalarının sınır değerlerine göre yeniden düzenlenmesi önerilmiştir.

---

## Prompt 4

**Soru:**  
Merge tabanlı bir oyunda ses efektlerinin yalnızca başarılı birleşme anında çalışması, fiziksel temas anlarında ise tetiklenmemesi için ses kontrol yapısı nasıl düzenlenmelidir?

**Alınan Yanıt Özeti:**  
Ses efektlerinin çarpışma algılamasından bağımsız olarak yalnızca başarılı birleşme mantığına bağlanması gerektiği belirtilmiştir. Böylece gereksiz ses tetiklenmelerinin önüne geçilmiştir.

---

## Prompt 5

**Soru:**  
Objelerin yere düştükten sonra aşırı sekmesi, kayması veya dengesiz hareket etmesi durumunda Canvas tabanlı fizik sisteminde hangi parametreler optimize edilmelidir?

**Alınan Yanıt Özeti:**  
Fiziksel enerji kaybı, sürtünme etkisi ve hareket azaltma katsayılarının optimize edilmesi önerilmiştir. Bu sayede nesnelerin daha doğal ve kontrollü hareket etmesi sağlanmıştır.

---

## Prompt 6

**Soru:**  
Game Over kontrol mekanizmasının oyun alanındaki çanta üst sınırı ile doğru hizalanması için konum bazlı kontrol yapısı nasıl iyileştirilebilir?

**Alınan Yanıt Özeti:**  
Game Over kontrol çizgisinin oyun alanı koordinat sistemine göre yeniden yapılandırılması ve görsel sınır ile mantıksal sınırın eşleştirilmesi önerilmiştir.

---

## Prompt 7

**Soru:**  
Yanlış yerleştirilen son objeyi geri alma mantığına sahip bir joker sistemi nasıl tasarlanabilir? Ancak obje merge gerçekleştirmişse bu geri alma işleminin devre dışı kalması nasıl sağlanabilir?

**Alınan Yanıt Özeti:**  
Son bırakılan objenin durum bilgisinin takip edilmesi, merge gerçekleşmeden önce geri alınabilir olması ve birleşme sonrası bu hakkın devre dışı bırakılması önerilmiştir.Kod desteği alınmıştır.

---

## Prompt 8

**Soru:**  
Wildcard mantığında çalışan ve diğer ürünlerle birleşebilen özel bonus ürün (golden boost) mekanizması için oyun mantığında nasıl bir yapı kurulabilir?

**Alınan Yanıt Özeti:**  
Standart merge mantığından bağımsız çalışan özel ürün tipleri için ek kontrol yapılarının tanımlanması ve bu ürünlerin oyun stratejisini destekleyici mekanik olarak kullanılması önerilmiştir.

---

## Sonuç

Yapay zeka araçları bu proje kapsamında hata ayıklama, belirli kod bloklarının düzenlenmesi, fizik sistemi iyileştirmeleri, oyun mekaniklerinin geliştirilmesi, teknik problem çözümü ve dokümantasyon desteği amacıyla kullanılmıştır.

Projeye ait tasarım kararları, oyun mekaniğinin uygulanması, görsel entegrasyonlar, testler ve nihai geliştirme süreçleri proje ekibi tarafından gerçekleştirilmiştir.
