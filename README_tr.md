# Komutlar: Klasörde not oluşturma

Bu eklenti belirlenmiş bir konumda yeni not oluşturmak için yeni bir komut ekler.

Konum eklemek için ayarlar sekmesini kullanın. Konum eklemeniz için seçim yapmanız gerekecek ve daha sonrasında bu konumda yeni bir not oluşturacaktır.

Ana menü şunları yapmanızı sağlar:
- Bir komutu çoğaltmak
- Hızlı geçiş komutu için düzenin yerini değiştirmek (Sadece "Bütün klasörler için uygula" seçeneğiyle kullanılabilir).

> [!NOT]
> Eğer geçerli klasöre konum atamak istiyorsanız, konumdaki `{{current}}` değişkenini kullanabilirsiniz. <br>
> > Bu komut sadece geçerli sekmede dosya açtığınız sürece çalışır. Aynı zamanda dosya menüsünü de kullanabilirsiniz. (Bunun ayarlarda aktif edilmiş olması gereklidir.)

Her klasör için:
- Başka bir dosya ismi ve olası bir şablon ile isimlendirildiğini
- Dosyanın oluşturulduğunu (Geçerli ve yeni sekmede, pencerede ya da bölünmüş ekranda.)
- Not oluşturulduktan sonra odak haline getirilip getirilmemesi gerektiğini
- Bir şablonun uygulanıp uygulanmaması gerektiğini (Templater kullanarak.)
- Dosya menüsünde bir komut isteyip istemediğinizi <br>
Seçebilirsiniz.

Konumu ekledikten sonra, "Create Note In Folder: {{commandName}}" komudunu kullanabilirsiniz. <br>

## Genel ayarlar

### Genel şablon

Ayarlar sekmesinde, varsayılan şablonu her klasör için tercih edip / düzenleyebilirsiniz. <br>

Varsayılan şablon iki şekilde kullanılabilir: <br>
- Bütün "kaydedilmiş" klasörler için varsayılan bir şablon (örnek olarak ayarlar sekmesinde bulunmayan klasörler)
- Yeni bir komut oluştururken kendiliğinden uygulanan bir şablon, hep aynı ayarları kullanıyorsanız diye. <br>

Her klasörde varsayılan şablonu kullanmak için, "uygula [enable]" butonuna basmanız gerekiyor. <br>

#### Hızlı Geçiş

Her klasör için varsayılan şablonu seçebilirsiniz. Bu durumda, varsayılan şablon; ayarlar sekmesinde bulunmayan klasörler için kullanılacaktır.
Hızlı Geçiş:
- `Create Note In Folder : Quick Switcher" komudunu kullanmanız için
- Kaydedilmiş klasörü silen hızlı-geçiş özelliğini filtrelemeniz için <br>
İşe yarayacaktır. <br>

### Özel değişkenler

Yeni dosya ve klasörler oluştururken, isimleri kişiselleştirmek için konumda özel değişkenler kullanabilirsiniz. Bir değişken kullanmak için, ismini `{{` ve `}}` sembolleri arasına koyun. Örnek olarak, eğer `birDegisken` isimli bir değişkeniniz varsa, konuma `{{birDegisken}}` şeklinde dahil edebilirsiniz. <br>

Eğer oluşturmak istediğiniz klasör daha oluşturulmadıysa, konumdaki bir değişkeni kullandığınız zaman oluşturulacaktır. <br>

Bazı adlandırma seçenekleriniz mevcuttur: <br>
1. **Düzenli İfadeler (regex):** Regexi `//` ile kapatın, örnek olarak: `/\d+-\d+/gi`. Bu eğik çizgiler ile ayrılmış numaraları eşleyecektir. Örnek olarak `{{/\d+-\d+/gi}}`. Bu ifade ile ismi eşleşen herhangi bir klasör, o klasörün içerikleri ile yer değiştirecektir. Örnek olarak, `/\d+-\d+/gi` ifadesini kullanarak, konumda `2021-01` adı verilmiş olan bir klasör oluşturmanıza izin verir. Bu aynı zamanda `2021-02`, `2021-03` benzeri isimlerde de işe yarar. Bu regexi kullanmadıkça, her klasör için farklı bir şablona ihtiyacınız olacaktır. <br>
2. **Mutlak Dizi**: Bir yazı dizisini olduğu gibi kullanın. <br>
3. **Tarih Formatı**: [moment.js](https://momentjs.com/docs/#/displaying/) kaynağını temsil alarak tarih formatları oluşturur, `GG-AA-YYYY` gibi, bu da geçerli tarihteki ile `2021-01-01` formatında yer değiştirecektir. Bu işlem, konumlarınızda dinamik tarihler kullanmanıza yarar, geçerli klasörde geçerli ayı `AA-YYYY` şeklinde kullanarak. Bu özellik olmadıkça, her ay için bireysel şablonlar oluşturmanız gerekmektedir. <br>

> [!NOT]
> Bu seçenekleri Templater ayarlarıyla kullanmak, bir sürü dosyada Templater seçeneğini kullanmanızı engelleyebilir. <br>

### Odaklanma

Oluşturulmuş dosyayı açmamak da tamamen sizin elinizdedir. Bu durumda, dosya arka planda oluşturulacaktır. Eğer bir şablon kullanırsanız, Templater API'sı kullanılacak, bir şey yapmanıza gerek kalmayacaktır. <br>

Bu ayarlar ile, numaralandırma seçeneği kapılı ise (incrementation) yeni bir dosya oluşturmak yerine mevcut dosyayı açabilirsiniz. <br>

> [!NOT]
> Numaralandırma seçeneğini, çoktan mevcut bir dosyayı açmak istemiyorsanız, açık hale getirin. <br>

## Klasör başına ayarlar

### Dosya ismi & şablonlar hakkında

Bir dosya ismi ve şablon tercih edebilirsiniz. Şablon:
- Dosyanın ismi
- [moment.js](https://momentjs.com/docs/#/displaying/) kaynağından bir tarih formatında
olabilir. <br>

Eğer şablon kullanmak isterseniz, dosya ismi oluşturmanıza gerek yoktur. Dahası, şablonun nasıl ekleneceğini seçebilirsiniz: <br>
- Dosya isminden önce (eğer varsa) <br>
- Dosya isminden sonra <br>
Ve seperatör koyabilirsiniz. <br>

Başlık, aynı isime sahip bir dosya çoktan mevcut ise numaralandırılacaktır. <br>

Eğer Templater eklentisi yüklenmiş haldeyse, notlarınıza şablon atayabilirsiniz. Not oluşturulduktan sonra, atanmış olan şablon devreye girecektir. Bu işlevsellik, "Klasör Şablonları" davranışını taklit etmek içindir. Fakat, yapımcı olarak, klasör konumlarının değişkenler ile kullanılmasına izin verdiğim için, daha özgür bir işlev kazanıyorsunuz. <br>

> [!NOT]
> Diğer bir deyişle, her klasöre bireysel bir şablon eklemek için bir sebep bulunmamaktadır. [Özel değişkenler](#özel-degişkenler)'i kullanmayı tercih etmelisiniz. <br>

#### Başlık numaralandırılması  <br>

Eğer aynı isimde bir dosya çoktan mevcut ise adlandırmak yerine numaralandırılma sistemini tercih edebilirsiniz. Eğer bu seçenek kapalıysa, eklenti, yeni bir dosya oluşturmak yerine mevcut dosyayı açacaktır. <br>

## Gelişmiş ayarlar <br>

Bu eklenti, Obsidian'ın yeni bir dosya oluştururken yaptığı davranışı taklit ederek satır içi başlığa odaklanmanızı sağlamaktadır. <br>
Fakat, `{{current}}` şablonuyla, kullanılan metod biraz daha ve bazı durumlarda çalışmayabilir. Ben varsayılan olarak 50ms bekleten bir zaman aşımı kullandım. Eğer yavaş bir bilgisayara sahipseniz, bu değeri `data.json` dosyasından artırabilirsiniz.  (`.obsidian/plugins/create-note-in-folder` konumunda)
Bunun için `timeOutForInlineTitle` adlı değişkeni aramanız gerekecektir. <br>

> [!NOTE]
> Eğer değişken yoksa, dosyanın en altına oluşturmanız gerekir. <br>

Bu değeri düzenlemek için iki farklı yol vardır: <br>

```json
{
  // (ayarlarınız bu satırdan önce gelecek)
  timeOutForInlineTitle: 50
}
```
Bu ayar masaüstü ve mobil uygulamarı için aynı değeri kullanacaktır. <br>

```json
{
  // (ayarlarınız bu satırdan önce gelecek)
  timeOutForInlineTitle: {
    desktop: 50,
    mobile: 100
  }
}
```
Bu ayar ise masaüstü ve mobil uygulamarı için farklı değeri kullanacaktır. <br>

Değeri değiştirdilten sonra eklentiyi yeniden değiştirmeniz gerekir. <br>

-—

# Eklentiyi Yükleme

- [x] Obsidian'ın topluluk eklentilerinden <br>
- [x] [BRAT](https://github.com/TfTHacker/obsidian42-brat#adding-a-beta-plugin)'dan  `https://github.com/mara-li/create-note-in-folder`'ı kullanarak <br>
- [x] GitHub üzerinde sürümler kısmından  <br>
  - Son sürümü indirin <br>
  - create-note-in-path.zip dosyasını `.obsidian/plugins/` konumuna çıkarın <br>
  - Obsidian ayarlarından, eklentiyi tekrar başlatın. <br>
  - Eklentiyi aktif edin. <br>

# 🎼 Çeviriler

- [x] İngilizce <br>
- [x] Fransızca <br>
- [x] Türkçe <br>

Çeviri eklemek için:
1. Depoyu forklayın. <br>
2. Çevirinizi  `src/i18n/locales` klasörüne, dil isminin kısaltımını kullanarak yazın (örnek olarak: `tr.json`). <br>
    - Dilinizin dosyalarını Obsidian'dan [Obsidian çevirileri](https://github.com/obsidianmd/obsidian-translations) kısmından veya Templater örnek olacak şekilde: `<% tp.obsidian.moment.locale() %>` komudunu alabilirsiniz. <br>
    - [`en.json`](./src/i18n/locales/en.json) dosyasının içeriklerini yeni dosyaya kopyalayın. <br>
    - İçeriği çevirin.
3. `i18n/i18next.ts`'i düzenleyin: <br>
     - `import * as <lang> from "./locales/<lang>.json";` ekleyin. <br>
     - `ressource` kısmını: `<lang> : {translation: <lang>}` ekleyerek düzenleyin. <br>

---

# Emeği geçenler
@SilentVoid13 ve @RafaelGB'e, bazı kodların alındığı [Templater](https://github.com/SilentVoid13/Templater) ve [dbFolder](https://github.com/RafaelGB/obsidian-db-folder) eklentileri için teşekkür ederiz.

---

<a href='https://ko-fi.com/X8X54ZYAV' target='_blank'><img height='36' style='border:0px;height:36px;display:block;margin-left:50%;' src='https://cdn.ko-fi.com/cdn/kofi1.png?v=3' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>
