# tekasukukata
Permainan Teka Suku Kata
# Permainan Rimakata: Good Old Days

## Penerangan Ringkas
Permainan Rimakata "Good Old Days" adalah sebuah permainan teka suku kata Bahasa Melayu yang menyeronokkan dan menguji minda. Pemain dijemput untuk kembali ke suasana nostalgia "zaman dahulu" sambil mencabar kemahiran bahasa mereka dengan meneka suku kata terakhir bagi perkataan-perkataan yang diberikan. Tema visual permainan ini diilhamkan oleh keindahan sawah bendang dan gunung-ganang.

## Ciri-ciri Utama
* **Tema Nostalgia:** Antara muka pengguna yang direka khas dengan elemen visual "Good Old Days".
* **Mod Permainan Teka Suku Kata:** Fokus utama adalah untuk meneka suku kata terakhir perkataan Bahasa Melayu yang dipaparkan.
* **Pendaftaran Nama Pemain:** Nama pemain disimpan untuk dipaparkan di papan markah.
* **Tahap Kesukaran Pelbagai:** Tiga tahap kesukaran (Asas, Sederhana, Maju) yang mempengaruhi had masa untuk meneka dan jumlah maksimum kesalahan yang dibenarkan.
* **Sistem Permarkahan Dinamik:** Pemain mendapat markah untuk setiap tekaan yang betul, dengan potensi bonus markah berdasarkan kepantasan menjawab.
* **Pemasa dan Penjejak Kesalahan:** Setiap perkataan disertakan dengan pemasa dan sistem penjejak "Kesalahan Merah".
* **Bantuan Makna Perkataan:** Pemain boleh memilih untuk melihat makna perkataan sebagai klu, dengan sedikit penalti pada markah.
* **Fungsi Jeda & Sambung:** Keupayaan untuk menjeda permainan dan menyambungnya semula.
* **Sesi Permainan Terhad:** Setiap sesi permainan akan berlangsung sehingga 20 perkataan.
* **Papan Markah (Leaderboard):** Menyimpan dan memaparkan 10 pemain dengan markah tertinggi menggunakan simpanan setempat pelayar (`localStorage`).
* **Data Perkataan Luaran:** Kesemua perkataan, suku kata akhir yang perlu diteka, dan maknanya dimuatkan dari fail luaran `kamusData.json` untuk memudahkan pengurusan dan kemas kini.

## Cara Bermain
1.  **Persediaan Awal:**
    * Buka permainan dan anda akan disambut dengan halaman utama yang memaparkan penerangan ringkas.
    * Klik butang "Mula Main".
    * Masukkan nama anda di halaman pendaftaran.
    * Pilih Tahap Kesukaran yang anda inginkan. Setiap tahap mempunyai cabaran masa dan had kesalahan yang berbeza.
2.  **Semasa Permainan:**
    * Satu perkataan akan muncul dengan sebahagian suku kata terakhirnya dikosongkan (contoh: "SEKO \_ \_ \_").
    * Gunakan papan kekunci anda untuk menaip huruf demi huruf bagi melengkapkan suku kata yang hilang pada medan input yang disediakan. Kursor akan berada di medan input secara automatik.
    * Perhatikan baki masa pada pemasa! Cuba jawab dengan pantas untuk mendapatkan bonus.
    * Setiap tekaan huruf yang salah akan meningkatkan kiraan "Kesalahan Merah". Elakkan daripada mencapai had maksimum kesalahan untuk tahap tersebut.
3.  **Menggunakan Bantuan:**
    * Jika anda menghadapi kesukaran, anda boleh klik butang "Paparkan Makna" untuk mendapatkan definisi perkataan tersebut. Namun, tindakan ini akan dikenakan sedikit penalti pada markah anda.
4.  **Matlamat Permainan:**
    * Cuba kumpulkan markah setinggi mungkin dengan meneka suku kata terakhir dengan tepat dan pantas untuk kesemua 20 perkataan dalam satu sesi permainan.
    * Cabar diri anda untuk tersenarai dalam Papan Markah Teratas!

## Teknologi yang Digunakan
* HTML5
* CSS3 (menggunakan Pemboleh Ubah CSS, Flexbox, dan Google Fonts)
* JavaScript (ES6+, tanpa sebarang framework luaran)

## Cara Pemasangan dan Menjalankan Permainan
1.  Pastikan anda mempunyai semua fail berikut dalam satu folder di komputer anda:
    * `index.html`
    * `style.css`
    * `script.js`
    * `kamusData.json` (Fail ini **mesti** berada di folder yang sama dengan `index.html` dan diisi dengan data perkataan, suku kata akhir yang **tepat**, dan makna)
    * `placeholder_kite.png` (atau imej lain yang anda gunakan untuk halaman utama)
    * (Pilihan) Folder `sounds/` jika anda telah menambah kesan bunyi.
2.  Buka fail `index.html` menggunakan mana-mana pelayar web moden (contoh: Google Chrome, Mozilla Firefox, Microsoft Edge, Safari).
3.  Permainan sedia untuk dimainkan!

## Struktur Fail Projek (Contoh)
