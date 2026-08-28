# SpongeBob-Inspired Image Cartoonification System 🧽🎨

[![Canva Presentation](https://img.shields.io/badge/Canva_Presentation-F9D71C?style=for-the-badge&logo=canva&logoColor=000000)](https://canva.link/7d4qorsobc6qgcl) 👈 Click to view the presentation on Canva

An interactive Computer Vision web application developed as a **Digital Image Processing** course project (Academic Year 2025–2026). The system transforms everyday photos into vibrant, cartoon-style graphics **inspired by SpongeBob SquarePants' iconic aesthetic**—characterized by bold black outlines, high color saturation, and a cheerful atmosphere.

---

## 🌟 Key Features
* **SpongeBob-Inspired Cartoon Effect:** Combines edge-preserving filtering, strong black outline extraction, and vibrant color enhancement to emulate classic animated cartoon visuals.
* **Dual Input Modes:** Upload local image files (JPG, PNG) or capture snapshots in real time using the device camera.
* **Real-Time Intensity Control:** Interactive slider to fine-tune cartoonization levels and outline boldness before rendering.
* **Dynamic Themes & UI:** Custom-styled interface with Light/Dark theme switching, responsive CSS layouts, and embedded interactive elements.
* **Background Audio:** Integrated ambient background music for an engaging user experience.
* **Instant Export:** Download processed high-resolution cartoon images directly via `st.download_button`.

---

## 🛠️ System Architecture & Tech Stack

### 1. Front-End & Web Interface
* **Framework:** Streamlit (Python-based interactive UI)
* **Custom Styling:** Embedded HTML, CSS animations (gradients, pulse effects, custom borders), and Base64 asset encoding.

### 2. Back-End & DIP Processing Pipeline
* **Libraries:** OpenCV (`cv2`), NumPy, Python 3.9+
* **Image Processing Pipeline:**
  * **Noise Reduction & Smoothing:** Bilateral filtering to smooth flat regions while preserving hard boundary edges.
  * **Edge Detection:** Adaptive thresholding and gradient edge masks to produce thick, defined comic outlines.
  * **Color Quantization & Boost:** Color palette simplification and saturation boosting for vivid tones.
  * **Mask Merging:** Bitwise combination of detected edge masks and quantized color layers to produce the final stylized output.

---

## 📸 Demo Preview

| Original Input | Cartoonified Output (SpongeBob Style) |
| :---: | :---: |
| <img src="https://github.com/user-attachments/assets/f6907f5f-e3be-47be-8fd3-e8417a1c0bb9" width="360" /> | <img src="https://github.com/user-attachments/assets/b68e08c9-c364-4d12-80d2-57fc4c51a25b" width="360" /> |

---

## 🚀 Getting Started

### Prerequisites
* Python 3.9 or higher

### Installation & Run

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/USERNAME/SpongeBob-Image-Cartoonification.git](https://github.com/USERNAME/SpongeBob-Image-Cartoonification.git)
   cd SpongeBob-Image-Cartoonification



1- Install dependencies:
pip install -r requirements.txt

2= Launch the Streamlit app:
streamlit run app.py

👥 Course Information
Course: Digital Image Processing (DIP)

Academic Year: 2025–2026
