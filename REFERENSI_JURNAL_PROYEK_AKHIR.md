# Referensi Jurnal untuk Proyek Akhir

**Judul (sementara):**  
ANALISIS DAN OPTIMASI QUALITY OF SERVICE (QOS) PADA CHATBOT BERBASIS LLM DENGAN ARSITEKTUR RAG MENGGUNAKAN PROMETHEUS DAN GRAFANA (STUDI KASUS: UGM ANJEM)

Dokumen ini berisi minimal 10 referensi jurnal/skripsi/artikel ilmiah yang relevan dengan isi proyek (chatbot LLM, RAG, QoS, monitoring Prometheus & Grafana). Sumber dipilih dari penerbit terpercaya (IEEE, ACM, MDPI, ScienceDirect, arXiv, jurnal terakreditasi Indonesia, repository perguruan tinggi).

---

## 1. RAG & Large Language Models (Survey)

**Gao, Y., Xiong, Y., Gao, X., et al. (2023).**  
*Retrieval-Augmented Generation for Large Language Models: A Survey.*  
arXiv:2312.10997.  
**Link:** https://arxiv.org/abs/2312.10997  

**Relevansi:** Survey komprehensif RAG untuk LLM: paradigma Naive/Advanced/Modular RAG, komponen retriever–generator–augmentation, dan kerangka evaluasi (termasuk metrik faithfulness, relevance). Sangat cocok untuk landasan teori arsitektur RAG pada chatbot Anda.

---

## 2. Systematic Literature Review RAG (Teknik, Metrik, Tantangan)

**MDPI (2025).**  
*A Systematic Literature Review of Retrieval-Augmented Generation: Techniques, Metrics, and Challenges.*  
MDPI — Information 9(12), 320. PRISMA 2020, 128 studi.  
**Link:** https://www.mdpi.com/2504-2289/9/12/320  

**Relevansi:** Review sistematis RAG: evolusi teknik (DPR, hybrid retrieval, modular RAG), metrik evaluasi (Recall@k, MRR@k, overlap metrics), dan tantangan efisiensi/keamanan. Mendukung pembahasan metrik dan pipeline RAG Anda.

---

## 3. Evaluasi Otomatis RAG (ARES)

**Saad-Falcon, J., Khattab, O., Potts, C., Zaharia, M. (2024).**  
*ARES: An Automated Evaluation Framework for Retrieval-Augmented Generation Systems.*  
NAACL 2024 (Association for Computational Linguistics).  
**Link:** https://aclanthology.org/2024.naacl-long.20/  

**Relevansi:** Framework evaluasi RAG otomatis: context relevance, answer faithfulness, answer relevance; synthetic data + Prediction-Powered Inference. Relevan untuk bagian evaluasi kualitas jawaban chatbot RAG.

---

## 4. RAGAS — Evaluasi RAG Tanpa Ground Truth

**Es, S., James, J., et al. (2023).**  
*RAGAS: Automated Evaluation of Retrieval Augmented Generation.*  
arXiv:2309.15217.  
**Link:** https://arxiv.org/abs/2309.15217  

**Relevansi:** Evaluasi RAG tanpa label manusia: faithfulness, answer relevance, context precision/recall. Sesuai untuk mendukung metrik kualitas selain latency/throughput (QoS dari sisi konten).

---

## 5. QoS Chatbot — Model Prediksi Fuzzy (IEEE)

**IEEE Conference Publication.**  
*Fuzzy Prediction Model to Measure Chatbot Quality of Service.*  
Document ID: 9494346.  
**Link:** https://ieeexplore.ieee.org/document/9494346  

**Relevansi:** Langsung membahas pengukuran Quality of Service chatbot dengan model fuzzy. Dapat dipakai sebagai referensi definisi dan pengukuran QoS chatbot.

---

## 6. Prometheus & Grafana — Stack Monitoring Berbasis Metrik

**Elradi, M.D. (2025).**  
*Prometheus & Grafana: A Metrics-focused Monitoring Stack.*  
Journal of Computer Allied Intelligence (JCAI), ISSN: 2584-2676.  
**DOI:** https://doi.org/10.69996/jcai.2025015  
**Link:** https://fringeglobal.com/ojs/index.php/jcai/article/view/prometheus-grafana-a-metrics-focused-monitoring-stack  

**Relevansi:** Implementasi stack Prometheus + Node Exporter + Grafana untuk pengumpulan dan visualisasi metrik; deployment dengan Docker. Langsung mendukung bagian monitoring QoS dengan Prometheus dan Grafana.

---

## 7. LMS Cloud & Monitoring dengan Grafana, Prometheus, Telegram

**Kusumawardhani, S., Rafi, M.F., Marpanaji, E.**  
*Experimental Study of High Availability Cloud Learning Management System and Monitoring System Based on Grafana, Prometheus, and Telegram.*  
Journal of Advanced Research Design.  
**DOI:** https://doi.org/10.37934/ard.136.1.6678  
**Link:** https://akademiabaru.com/submit/index.php/ard/article/view/6603  

**Relevansi:** Studi eksperimen monitoring sistem cloud dengan Grafana & Prometheus; notifikasi real-time. Mendukung pembahasan observability dan peningkatan kualitas layanan berbasis monitoring.

---

## 8. Survey Chatbot & LLM — Testing and Evaluation

**ScienceDirect / Natural Language Processing Journal (2025).**  
*A survey on chatbots and large language models: Testing and evaluation techniques.*  
Volume 10, March 2025.  
**Link:** https://www.sciencedirect.com/science/article/pii/S2949719125000044  

**Relevansi:** Survey teknik pengujian dan evaluasi chatbot serta LLM: komponen NLU, dialogue management, NLG; metrik dan framework evaluasi; dataset dan benchmark. Relevan untuk kerangka evaluasi QoS dan kualitas chatbot.

---

## 9. Chatbot Berbasis LLM + RAG (Indonesia — PNJ)

**Repository Politeknik Negeri Jakarta.**  
*Rancang Bangun Sistem Informasi Hak Kekayaan Intelektual Dengan Integrasi Chatbot berbasis Large Language Model.*  
**Link:** https://repository.pnj.ac.id/id/eprint/27373/  

**Relevansi:** Skripsi D4 dengan chatbot LLM dan pendekatan Retrieval-Augmented Generation (RAG); User Acceptance Test dan Explainable AI (LIME). Konteks Indonesia dan RAG cocok untuk studi kasus dan perbandingan.

---

## 10. Implementasi Chatbot LLM untuk Pencarian Skripsi (Indonesia — Arcitech)

**Arcitech: Journal of Computer Science and Artificial Intelligence (IAIN Curup).**  
*Implementasi Chatbot Berbasis Large Language Model Untuk Pencarian Skripsi Mahasiswa Terintegrasi dengan Whatsapp.*  
**Link:** https://journal.iaincurup.ac.id/index.php/arcitech/article/view/13974  

**Relevansi:** Implementasi chatbot LLM (framework LangChain) di konteks akademik Indonesia; evaluasi akurasi dan User Experience Questionnaire. Mendukung pembahasan chatbot LLM dalam konteks layanan institusi/komunitas.

---

## 11. Pengembangan Chatbot LLM — Studi Kasus Perusahaan (Indonesia — UPI)

**Repository Universitas Pendidikan Indonesia.**  
*PENGEMBANGAN CHATBOT PADA SISTEM INFORMASI BERBASIS LARGE LANGUAGE MODEL: Studi Kasus di PT Bukit Makmur Mandiri Utama.*  
**Link:** https://repository.upi.edu/130107/  

**Relevansi:** Skripsi S1 chatbot berbasis LLM (GPT-4o, Azure); metrik Precision, Recall, dan kerelevanan. Berguna untuk perbandingan metrik kualitas dan studi kasus di Indonesia.

---

## 12. Evaluasi & Benchmarking Chatbot Generatif AI (MDPI)

**MDPI Electronics (2025).**  
*Extension of Interval-Valued Hesitant Fermatean Fuzzy TOPSIS for Evaluating and Benchmarking of Generative AI Chatbots.*  
Electronics 14(3), 555.  
**Link:** https://www.mdpi.com/2079-9292/14/3/555  

**Relevansi:** Metode evaluasi dan benchmarking chatbot generatif AI dengan pendekatan fuzzy multi-kriteria (TOPSIS). Dapat dikutip untuk dimensi kualitas dan QoS dari sisi pengguna/benchmark.

---

## 13. Observability untuk Sistem LLM (Metrik, Trace, Log)

**Glukhov, R.**  
*Observability for LLM Systems: Metrics, Traces, Logs, and Testing in Production.*  
**Link:** https://www.glukhov.org/observability/observability-for-llm-systems/  

**Relevansi:** Rekomendasi observability sistem LLM: metrik (TTFT, latency, throughput), Prometheus, tracing, logging. Selaras dengan pendekatan Prometheus/Grafana dan breakdown latency (retrieval, generation) di proyek Anda.

---

## 14. Multi-Turn RAG Benchmark (TACL)

**MTRAG.**  
*MTRAG: A Multi-Turn Conversational Benchmark for Evaluating Retrieval-Augmented Generation Systems.*  
Transactions of the Association for Computational Linguistics (TACL).  
**Link:** https://transacl.org/index.php/tacl/article/view/7735  

**Relevansi:** Benchmark RAG dalam percakapan multi-turn; metrik dan skenario evaluasi. Berguna untuk bagian evaluasi RAG dalam setting percakapan seperti chatbot.

---

## Ringkasan Relevansi dengan Proyek ChatbotAnjemUGM

| Aspek Proyek | Referensi yang Relevan |
|--------------|------------------------|
| Arsitektur RAG (retrieval + generator) | 1, 2, 3, 4, 9 |
| QoS: latency, throughput, error rate | 5, 8, 12, 13 |
| Prometheus & Grafana | 6, 7, 13 |
| Evaluasi kualitas jawaban RAG | 3, 4, 8 |
| Chatbot LLM konteks Indonesia | 9, 10, 11 |
| Monitoring & observability | 6, 7, 13 |

---

**Catatan:**  
- Untuk IEEE/ACM/MDPI/ScienceDirect, akses full text mungkin memerlukan langganan institusi atau pembelian.  
- arXiv dapat diakses gratis.  
- Repository perguruan tinggi Indonesia (PNJ, UPI) dan jurnal open access (Arcitech, JCAI, MDPI) umumnya dapat diunduh gratis.  
- Sebelum dikutip di skripsi, pastikan penulisan sitasi mengikuti panduan fakultas (APA, IEEE, atau lainnya) dan cek kembali DOI/volume/issue dari sumber resmi.
