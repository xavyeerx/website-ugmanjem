# BAB I
# PENDAHULUAN

## 1.1. Latar Belakang

Mobilitas merupakan bagian yang tidak terpisahkan dari kehidupan mahasiswa, terutama pada perguruan tinggi dengan skala besar dan aktivitas akademik yang tersebar di banyak unit. Universitas Gadjah Mada sebagai salah satu perguruan tinggi besar di Indonesia memiliki 50.090 mahasiswa, 18 fakultas, dan 278 program studi [1]. Skala tersebut menunjukkan bahwa perpindahan mahasiswa antarruang kuliah, laboratorium, perpustakaan, pusat layanan, dan berbagai titik aktivitas lainnya merupakan kebutuhan sehari-hari. UGM sendiri telah menyediakan dukungan mobilitas melalui layanan sepeda kampus serta program peminjaman sepeda bagi mahasiswa yang membutuhkan, yang menunjukkan bahwa persoalan akses transportasi dan kemudahan mobilitas mahasiswa merupakan kebutuhan nyata di lingkungan kampus [2], [3]. Namun demikian, kebutuhan mobilitas mahasiswa tidak selalu terbatas pada perjalanan rutin di dalam kampus, melainkan juga mencakup kebutuhan perjalanan yang lebih fleksibel, cepat, terjangkau, dan sesuai dengan dinamika aktivitas akademik maupun nonakademik. Dalam kondisi tersebut, layanan berbasis komunitas muncul sebagai alternatif solusi yang lebih adaptif terhadap kebutuhan pengguna. Dalam konteks inilah UGM Anjem hadir sebagai layanan antar jemput dan jasa titip berbasis komunitas mahasiswa UGM.

Sebagai layanan berbasis komunitas, UGM Anjem berhadapan dengan kebutuhan penyampaian informasi yang cepat, akurat, dan konsisten terkait jenis layanan, tarif, prosedur pemesanan, wilayah jangkauan, serta kontak yang dapat dihubungi. Pada praktiknya, kebutuhan informasi tersebut dapat muncul kapan saja, sedangkan layanan yang bergantung pada respons manual berisiko menimbulkan keterlambatan, ketidakkonsistenan jawaban, dan keterbatasan akses pada jam tertentu. Kondisi ini menjadi persoalan penting karena kualitas layanan informasi turut memengaruhi kepercayaan pengguna terhadap layanan utama yang disediakan. Oleh karena itu, diperlukan sarana informasi digital yang mampu melayani pertanyaan pengguna secara lebih responsif tanpa mengurangi ketepatan informasi yang disampaikan.

Pemanfaatan chatbot berbasis *Artificial Intelligence* menjadi salah satu pendekatan yang relevan untuk menjawab kebutuhan tersebut. Kehadiran *Large Language Model* (LLM) mendorong perkembangan sistem *conversational AI* yang mampu memahami pertanyaan pengguna dan menghasilkan jawaban dalam bahasa alami. Meskipun demikian, model generatif yang hanya mengandalkan pengetahuan parametrik masih berisiko menghasilkan *hallucination*, menggunakan informasi yang tidak mutakhir, atau memberikan jawaban yang tidak sepenuhnya sesuai dengan konteks layanan yang ditanyakan [4], [5]. Dalam konteks layanan seperti UGM Anjem, ketidakakuratan semacam ini dapat menurunkan reliabilitas layanan informasi karena pengguna membutuhkan jawaban yang bersifat faktual dan sesuai dengan basis pengetahuan yang tersedia.

Untuk mengurangi keterbatasan tersebut, pendekatan *Retrieval-Augmented Generation* (RAG) digunakan dengan menggabungkan kemampuan *retrieval* untuk mengambil informasi relevan dari sumber eksternal dan kemampuan generator LLM untuk menyusun jawaban berdasarkan konteks tersebut [4]. Pendekatan ini sesuai untuk layanan UGM Anjem karena informasi yang digunakan bersumber dari *knowledge base* seperti *frequently asked questions*, prosedur operasional, serta data layanan yang dapat diperbarui. Dengan demikian, chatbot tidak hanya berfungsi sebagai antarmuka percakapan, tetapi juga sebagai sistem penelusuran informasi yang terikat pada data layanan yang sahih dan terstruktur.

Meskipun RAG dapat meningkatkan kualitas jawaban, penerapan chatbot berbasis LLM tidak berhenti pada aspek akurasi semata. Sistem semacam ini terdiri atas beberapa tahap pemrosesan, seperti penerimaan permintaan, *retrieval* dokumen, pengambilan konteks tambahan, dan generasi jawaban, sehingga berpotensi menimbulkan latensi yang beragam, *error* pada tahap tertentu, serta variasi performa antarpermintaan. Dalam layanan digital yang berinteraksi langsung dengan pengguna, persoalan tersebut berkaitan dengan *Quality of Service* (QoS), yang antara lain mencakup waktu respons, jumlah permintaan, tingkat kesalahan, dan kestabilan layanan [6]. Apabila metrik-metrik tersebut tidak dipantau secara terukur, pengelola sistem akan kesulitan mengetahui apakah keterlambatan berasal dari proses *retrieval*, sumber data eksternal, atau proses generasi oleh model.

Atas dasar itu, diperlukan sistem *monitoring* QoS yang mampu mengamati perilaku chatbot secara berkelanjutan dan terukur. Pada penelitian ini, *monitoring* dipusatkan pada metrik berbasis *time-series* yang relevan dengan QoS, seperti jumlah permintaan, latensi *end-to-end*, latensi per tahap *pipeline*, serta tingkat kesalahan. Kebutuhan ini menjadikan Prometheus dan Grafana sebagai pilihan yang sesuai. Prometheus menyediakan mekanisme pengumpulan metrik berbasis *pull*, penyimpanan *time-series*, tipe metrik seperti *counter*, *gauge*, *histogram*, dan *summary*, serta bahasa kueri *PromQL* yang mendukung analisis laju permintaan, rata-rata latensi, dan kuantil latensi [7], [10], [11], [12]. Sementara itu, Grafana melengkapi proses tersebut melalui *dashboard* visual yang memudahkan interpretasi pola performa dan hubungan antar metrik dalam rentang waktu tertentu [13]. Dibandingkan pendekatan yang berfokus pada analisis log atau layanan *application performance monitoring* komersial, Prometheus-Grafana lebih sesuai dengan kebutuhan penelitian ini karena berorientasi pada metrik QoS, bersifat *open-source*, mudah diintegrasikan pada layanan *backend* dan lingkungan *containerized*, serta memungkinkan replikasi eksperimen secara lebih terbuka dan terukur [8], [13].

Penelitian dan implementasi chatbot berbasis LLM dengan arsitektur RAG di konteks Indonesia telah dilakukan, antara lain untuk layanan pencarian skripsi dan sistem informasi institusi, dengan evaluasi mencakup akurasi, relevansi jawaban, dan penerimaan pengguna [9]. Namun, kajian yang secara khusus menelaah QoS chatbot berbasis LLM dengan arsitektur RAG pada konteks layanan berbasis komunitas masih terbatas, terutama yang memerinci metrik performa pada setiap tahap *pipeline* layanan. Berangkat dari permasalahan tersebut, penelitian ini memanfaatkan arsitektur RAG untuk mendukung kualitas jawaban dan menggunakan instrumentasi Prometheus-Grafana untuk menganalisis QoS chatbot secara terukur. Dengan demikian, penelitian ini diharapkan dapat memberikan gambaran yang lebih jelas mengenai karakteristik performa chatbot UGM Anjem dan faktor-faktor yang memengaruhi kualitas layanannya.

Proyek akhir ini berfokus pada analisis *Quality of Service* (QoS) pada chatbot berbasis LLM dengan arsitektur RAG, dengan studi kasus UGM Anjem. Sistem chatbot memanfaatkan RAG yang menggabungkan *retrieval* dari basis pengetahuan, konteks data layanan, serta LLM untuk generasi jawaban. Metrik QoS yang dianalisis meliputi jumlah permintaan *chat*, latensi *end-to-end*, latensi per tahap *pipeline* (*retrieval*, *live context*, dan generasi), serta tingkat kesalahan yang diinstrumentasi menggunakan Prometheus dan divisualisasikan melalui *dashboard* Grafana. Melalui pendekatan tersebut, penelitian ini diarahkan untuk menghasilkan analisis yang sistematis mengenai performa chatbot UGM Anjem sebagai dasar evaluasi kualitas layanan.

---

## 1.2. Rumusan Masalah

Berdasarkan latar belakang di atas, rumusan masalah yang ditinjau dalam proyek akhir ini adalah sebagai berikut:

1. Bagaimana merancang dan mengimplementasikan instrumentasi metrik QoS pada chatbot berbasis LLM dengan arsitektur RAG untuk studi kasus UGM Anjem?
2. Bagaimana mengintegrasikan Prometheus dan Grafana untuk pengumpulan, penyimpanan, dan visualisasi metrik QoS chatbot UGM Anjem?
3. Bagaimana karakteristik QoS chatbot UGM Anjem berdasarkan metrik jumlah permintaan, latensi *end-to-end*, latensi per tahap *pipeline*, dan tingkat kesalahan yang diperoleh dari hasil *monitoring*?

---

## 1.3. Tujuan Proyek Akhir

Penelitian ini bertujuan untuk menganalisis *Quality of Service* (QoS) pada chatbot berbasis LLM dengan arsitektur RAG menggunakan Prometheus dan Grafana, dengan studi kasus UGM Anjem. Tujuan spesifik yang ingin dicapai adalah sebagai berikut:

1. Merancang dan mengimplementasikan instrumentasi metrik QoS pada chatbot berbasis LLM dengan arsitektur RAG untuk layanan UGM Anjem.
2. Mengintegrasikan Prometheus dan Grafana untuk pengumpulan, penyimpanan, dan visualisasi metrik QoS chatbot UGM Anjem.
3. Menganalisis karakteristik QoS chatbot UGM Anjem berdasarkan metrik jumlah permintaan, latensi *end-to-end*, latensi per tahap *pipeline*, dan tingkat kesalahan yang diperoleh dari hasil *monitoring*.

## 1.4. Manfaat Proyek Akhir

Berdasarkan tujuan di atas, proyek akhir ini diharapkan memberikan manfaat sebagai berikut:

1. **Manfaat Teoritis**  
   Memberikan kontribusi pada kajian mengenai analisis QoS pada chatbot berbasis LLM dengan arsitektur RAG, khususnya melalui penerapan *monitoring* metrik berbasis Prometheus dan visualisasi Grafana.

2. **Manfaat Praktis bagi UGM Anjem**  
   Menyediakan gambaran terukur mengenai performa chatbot UGM Anjem, sehingga pengelola layanan dapat memahami kondisi layanan informasi digital yang dijalankan.

3. **Manfaat Praktis bagi Penulis**  
   Meningkatkan pemahaman dan keterampilan dalam pengembangan chatbot RAG, instrumentasi metrik, serta penggunaan Prometheus dan Grafana untuk analisis QoS.

4. **Manfaat Praktis bagi Institusi**  
   Menyediakan referensi dan studi kasus bagi mahasiswa atau peneliti lain yang ingin mengembangkan atau mengevaluasi chatbot berbasis LLM dengan pendekatan *observability* dan QoS.

---

## 1.5. Batasan Masalah

Batasan masalah dalam proyek akhir ini ditetapkan sebagai berikut:

1. Chatbot yang dikembangkan berfokus pada layanan informasi UGM Anjem (layanan antar jemput dan jasa titip) dengan basis pengetahuan berupa FAQ, SOP driver, dan data layanan yang tersedia dalam proyek.
2. Arsitektur chatbot menggunakan pendekatan RAG dengan komponen *retrieval* (berbasis *vector store*), *live context* (jika tersedia), dan LLM untuk generasi jawaban; model LLM yang digunakan dibatasi pada yang telah ditentukan dalam implementasi proyek (misalnya Gemini).
3. Metrik QoS yang dianalisis dibatasi pada jumlah permintaan *chat*, latensi *end-to-end*, latensi per tahap *pipeline* (*retrieval*, *live context*, dan generasi), serta tingkat kesalahan; pemantauan dilakukan dengan Prometheus dan visualisasi dengan Grafana.
4. Lingkup penelitian difokuskan pada analisis QoS berdasarkan metrik yang diekspos oleh sistem dan tidak mencakup pengukuran kualitas jawaban secara mendalam dengan kerangka evaluasi RAG seperti *faithfulness*, *context precision*, atau *answer relevance*.
5. Penelitian ini tidak melakukan perbandingan dengan perangkat *monitoring* lain; Prometheus dan Grafana digunakan sebagai alat utama pengumpulan dan visualisasi metrik QoS.
6. Lingkungan implementasi dan pemantauan dibatasi pada sistem yang digunakan dalam proyek, seperti layanan *backend* dan *deployment* berbasis *container*; integrasi dengan platform orkestrasi lain tidak menjadi bagian penelitian.
7. Pengembangan antarmuka pengguna (*front-end*) tidak menjadi fokus utama; penekanan penelitian terletak pada *backend* chatbot, instrumentasi metrik, dan analisis QoS.

---

# DAFTAR PUSTAKA

[1] Universitas Gadjah Mada, "About UGM," [Online]. Available: https://ugm.ac.id/en/about

[2] Universitas Gadjah Mada, "Transportasi Mahasiswa," [Online]. Available: https://ugm.ac.id/id/3550-transportasi-mahasiswa/

[3] T. Andriyani, "UGM pinjamkan sepeda bagi mahasiswa untuk mobilitas ke kampus," Universitas Gadjah Mada, 7 Agustus 2024. [Online]. Available: https://ugm.ac.id/id/berita/ugm-pinjamkan-sepeda-bagi-mahasiswa-untuk-mobilitas-ke-kampus/

[4] Y. Gao et al., "Retrieval-augmented generation for large language models: A survey," *arXiv preprint arXiv:2312.10997*, 2023.

[5] "A survey on chatbots and large language models: Testing and evaluation techniques," *Natural Language Processing J.*, vol. 10, pp. 1-20, Mar. 2025. [Online]. Available: https://www.sciencedirect.com/science/article/pii/S2949719125000044

[6] "Fuzzy prediction model to measure chatbot quality of service," in *Proc. IEEE Conf.*, 2021, Art. no. 9494346. [Online]. Available: https://ieeexplore.ieee.org/document/9494346

[7] M. D. Elradi, "Prometheus & Grafana: A metrics-focused monitoring stack," *J. Comput. Allied Intell. (JCAI)*, vol. 1, 2025, doi: 10.69996/jcai.2025015.

[8] S. Kusumawardhani, M. F. Rafi, and E. Marpanaji, "Experimental study of high availability cloud learning management system and monitoring system based on Grafana, Prometheus, and Telegram," *J. Adv. Res. Des.*, vol. 136, no. 1, pp. 66-78, 2024, doi: 10.37934/ard.136.1.6678.

[9] "Implementasi chatbot berbasis large language model untuk pencarian skripsi mahasiswa terintegrasi dengan WhatsApp," *Arcitech: J. Comput. Sci. Artif. Intell.*, 2024. [Online]. Available: https://journal.iaincurup.ac.id/index.php/arcitech/article/view/13974

[10] Prometheus Authors, "Metric types," [Online]. Available: https://prometheus.io/docs/concepts/metric_types/

[11] Prometheus Authors, "Histograms and summaries," [Online]. Available: https://prometheus.io/docs/practices/histograms/

[12] Prometheus Authors, "Querying basics," [Online]. Available: https://prometheus.io/docs/prometheus/latest/querying/basics/

[13] Grafana Labs, "About metrics and telemetry," [Online]. Available: https://grafana.com/docs/grafana/latest/explore/simplified-exploration/metrics/about-metrics
