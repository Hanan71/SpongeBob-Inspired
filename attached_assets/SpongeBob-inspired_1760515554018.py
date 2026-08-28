import streamlit as st
import numpy as np
import cv2
from PIL import Image

st.set_page_config(page_title="🎨 SpongeBob-inspired Cartoonizer", page_icon="🧽", layout="centered")

# 🎨 تصميم الواجهة
st.markdown("""
    <style>
    body { background-color: #cde9f6; }
    .title {
        text-align: center;
        font-size: 40px;
        color: #ffcc00;
        text-shadow: 2px 2px 0 #000;
        font-weight: bold;
        margin-bottom: 10px;
    }
    .subtitle {
        text-align: center;
        font-size: 20px;
        color: #0077b6;
        margin-bottom: 30px;
    }
    </style>
""", unsafe_allow_html=True)

st.markdown("<div class='title'>🧽 SpongeBob Cartoonizer</div>", unsafe_allow_html=True)
st.markdown("<div class='subtitle'>حوّل صورتك إلى كرتون بأسلوب SpongeBob!</div>", unsafe_allow_html=True)

# 🧠 دالة تحويل الصورة لستايل SpongeBob
def spongebob_style(frame):
    img_color = cv2.bilateralFilter(frame, 12, 300, 300)
    img_gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    img_blur = cv2.medianBlur(img_gray, 5)
    edges = cv2.adaptiveThreshold(img_blur, 255,
                                  cv2.ADAPTIVE_THRESH_MEAN_C,
                                  cv2.THRESH_BINARY, 9, 2)
    edges = cv2.cvtColor(edges, cv2.COLOR_GRAY2BGR)
    hsv = cv2.cvtColor(img_color, cv2.COLOR_BGR2HSV)
    hsv[:, :, 1] = cv2.add(hsv[:, :, 1], 60)
    hsv[:, :, 2] = cv2.add(hsv[:, :, 2], 40)
    img_color = cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)
    cartoon = cv2.bitwise_and(img_color, edges)
    return cartoon

# 📸 اختيار طريقة الإدخال
option = st.radio("اختاري طريقة الإدخال:", ["📤 رفع صورة", "📸 التقاط من الكاميرا"])

# 🖼️ رفع الصورة
if option == "📤 رفع صورة":
    uploaded_file = st.file_uploader("حمّلي صورتك هنا", type=["jpg", "jpeg", "png"])
    if uploaded_file is not None:
        image = Image.open(uploaded_file).convert('RGB')
        img = np.array(image)
        img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)

        st.image(image, caption="📷 صورتك الأصلية", use_container_width=True)

        if st.button("✨ حوّل إلى كرتون"):
            cartoon = spongebob_style(img)
            cartoon_rgb = cv2.cvtColor(cartoon, cv2.COLOR_BGR2RGB)
            st.image(cartoon_rgb, caption="🎨 صورتك بأسلوب SpongeBob", use_container_width=True)

# 📸 التقاط من الكاميرا
else:
    picture = st.camera_input("التقط صورة بالكاميرا 🎥")

    if picture is not None:
        img = Image.open(picture).convert('RGB')
        img = np.array(img)
        img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)

        cartoon = spongebob_style(img)
        cartoon_rgb = cv2.cvtColor(cartoon, cv2.COLOR_BGR2RGB)

        st.image(cartoon_rgb, caption="🎨 صورتك بأسلوب SpongeBob", use_container_width=True)

        # زر تحميل
        result_img = Image.fromarray(cartoon_rgb)
        st.download_button(
            label="⬇️ تحميل الصورة الناتجة",
            data=result_img.tobytes(),
            file_name="spongebob_cartoon.png",
            mime="image/png"
        )
