import streamlit as st
import numpy as np
import cv2
from PIL import Image
import base64
from io import BytesIO

st.set_page_config(page_title="SpongeBob Cartoonizer", page_icon="🧽", layout="wide") 

def get_base64_of_bin_file(bin_file):
    try:
        with open(bin_file, 'rb') as f:
            data = f.read()
        return base64.b64encode(data).decode()
    except FileNotFoundError:
        print(f"⚠️ تنبيه: الملف '{bin_file}' غير موجود. يرجى التأكد من وجوده.")
        return ""

# 🖼️ الخلفية والصور الثابتة
background_file = 'images.jpg' 
background_base64 = get_base64_of_bin_file(background_file)

bottom_left_file = 'image.jpg' 
bottom_left_base64 = get_base64_of_bin_file(bottom_left_file)


# 🌟 CSS وتصميم الصفحة
st.markdown(
f"""
<style>
/* ⚙️ إخفاء العناصر الافتراضية */
#MainMenu {{visibility: hidden;}}
footer {{visibility: hidden;}}
header {{visibility: hidden;}} 

/* خلفية كاملة (صورتك البحرية الداكنة للجزء السفلي) */
.stApp {{
    background-image: url("data:image/jpg;base64,{background_base64}");
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    background-attachment: fixed;
    padding-top: 0 !important;
}}

.bottom-left-image {{
    display: none;
}}

/* 🌊 القسم الجديد: حاوية الرأس البيضاء/الزرقاء الفاتحة */
.clean-wave-header {{
    position: relative;
    width: 100%;
    height: 350px; 
    background-color: #008CBA; 
    padding-top: 50px;
    z-index: 10;
    margin-top: -20px; 
    margin-bottom: 50px; 
    
    /* 💥 التعديل الحاسم: موجة أكثر سلاسة وتمتد على كامل العرض */
    clip-path: polygon(
        0 0,         /* أعلى يسار */
        100% 0,        /* أعلى يمين */
        100% 70%,      /* يمين منتصف (نقطة بداية المنحنى من اليمين) */
        90% 80%,       /* منحنى أسفل قليلاً */
        80% 75%,       /* منحنى أعلى قليلاً */
        70% 85%,       /* منحنى أسفل قليلاً */
        60% 70%,       /* منحنى أعلى قليلاً */
        50% 80%,       /* منحنى أسفل قليلاً (القاع الأوسط) */
        40% 70%,       /* منحنى أعلى قليلاً */
        30% 85%,       /* منحنى أسفل قليلاً */
        20% 75%,       /* منحنى أعلى قليلاً */
        10% 80%,       /* منحنى أسفل قليلاً */
        0% 70%         /* يسار منتصف (نقطة نهاية المنحنى عند اليسار) */
    );
    /* ملاحظة: يمكنك تعديل قيم الـ Y (النسبة المئوية الثانية) لجعل الموجة أعمق أو أقل عمقاً */
    /* زيادة قيم الـ Y في الجزء السفلي (مثل 70%, 80%, 75%...) ستجعل الموجة أكثر عمقاً. */
    /* تقليل قيم الـ Y سيجعلها أقل انحداراً. */
}}

/* 🖋️ تصميم العناوين داخل الموجة (ألوان مشرقة) */
.title-wave {{
    text-align: center;
    font-size: 45px;
    color: #FFFFFF; 
    text-shadow: 1px 1px 2px #000; 
    font-weight: bold;
    margin-bottom: 5px;
    z-index: 12;
    position: relative;
}}
.subtitle-wave {{
    text-align: center;
    font-size: 20px;
    color: #FFD700; 
    text-shadow: 1px 1px 2px #000;
    margin-bottom: 30px;
    z-index: 12;
    position: relative;
}}

/* 🛠️ تصميم الأزرار و الـ uploader (ألوان نظيفة ومشرقة) */
.stRadio > label {{ display: none; }}
div[data-baseweb="radio"] {{ justify-content: center; gap: 15px; margin-bottom: 0; }} 
div[data-baseweb="radio"] label {{
    background-color: #FFFFFF;
    border: 1px solid #DCDCDC; border-radius: 8px; padding: 10px 25px;
    font-weight: bold; color: #4A4A4A; box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}}
div[data-baseweb="radio"] input:checked + label {{
    background-color: #FFD700; 
    border-color: #FFA500; color: #333333;
}}

.stFileUploader > div > div {{
    border: 2px dashed #9E9E9E;
    border-radius: 10px; padding: 40px 20px;
    background-color: rgba(255, 255, 255, 0.9);
    margin-bottom: 30px; 
}}
.stFileUploader > div > div p {{ 
    color: #4A4A4A; 
    font-weight: bold; 
}}
.stFileUploader > div > div small {{ 
    color: #6A6A6A; 
}}
.stFileUploader > div > div svg {{ 
    color: #FFD700; 
    font-size: 50px; 
}}

div.stButton > button:first-child, .stDownloadButton > button {{
    background-color: #FFD700; color: #333333; font-weight: bold;
    border-radius: 8px; border: none; padding: 12px 25px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2); 
}}
div.stButton > button:first-child:hover, .stDownloadButton > button:hover {{
    background-color: #FFA500;
}}
</style>

<img src="data:image/jpg;base64,{bottom_left_base64}" class="bottom-left-image">

<div class='clean-wave-header'>
    <div class='title-wave'>🧽 SpongeBob inspired</div>
    <div class='subtitle-wave'>حوّل صورتك إلى كرتون بأسلوب SpongeBob!</div>
</div>
""",
unsafe_allow_html=True
)

# 🧠 دالة تحويل الصورة لستايل SpongeBob (بقية الكود تبقى كما هي)
def spongebob_style(frame, intensity):
    # ... (الدالة هنا) ...
    blur_strength = int(5 + intensity * 2)
    if blur_strength % 2 == 0:
        blur_strength += 1
        
    color_smooth = int(9 + intensity * 2)
    
    img_color = cv2.bilateralFilter(frame, color_smooth, 300, 300)
    img_gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    img_blur = cv2.medianBlur(img_gray, blur_strength)
    edges = cv2.adaptiveThreshold(img_blur, 255,
                                     cv2.ADAPTIVE_THRESH_MEAN_C,
                                     cv2.THRESH_BINARY, 9, 2)
    edges = cv2.cvtColor(edges, cv2.COLOR_GRAY2BGR)

    hsv = cv2.cvtColor(img_color, cv2.COLOR_BGR2HSV)
    hsv[:, :, 1] = cv2.add(hsv[:, :, 1], 40 + intensity * 5)
    hsv[:, :, 2] = cv2.add(hsv[:, :, 2], 30 + intensity * 5)
    img_color = cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)

    cartoon = cv2.bitwise_and(img_color, edges)
    return cartoon

# 📸 اختيار طريقة الإدخال
option = st.radio("", ["رفع صورة", "كاميرا"], index=0, key="input_method_radio")

# 🖼️ رفع الصورة
if option == "رفع صورة":
    uploaded_file = st.file_uploader("اسحب وأفلت صورتك هنا\nأو اضغط للاختيار من جهازك\nالصور المدعومة: JPG, PNG, WebP", type=["jpg", "jpeg", "png", "webp"])
    if uploaded_file is not None:
        image = Image.open(uploaded_file).convert('RGB')
        img = np.array(image)
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        st.image(image, caption="📷 صورتك الأصلية", use_container_width=True)
        
        intensity = st.slider("اختاري شدة التحويل الكرتوني 🎨", 1, 10, 5)

        col1, col2, col3 = st.columns([1, 1, 1])
        with col2:
            if st.button("✨ حوّل إلى كرتون", use_container_width=True):
                cartoon = spongebob_style(img, intensity)
                cartoon_rgb = cv2.cvtColor(cartoon, cv2.COLOR_BGR2RGB)
                st.image(cartoon_rgb, caption=f"🎨 صورتك بأسلوب SpongeBob (الدرجة: {intensity})", use_container_width=True)
                
                result_img = Image.fromarray(cartoon_rgb)
                buf = BytesIO()
                result_img.save(buf, format="PNG")
                byte_im = buf.getvalue()
                
                col_down1, col_down2, col_down3 = st.columns([1, 1, 1])
                with col_down2:
                    st.download_button(
                        label="⬇️ تحميل الصورة الناتجة",
                        data=byte_im,
                        file_name="spongebob_cartoon_upload.png",
                        mime="image/png",
                        use_container_width=True
                    )

# 📸 التقاط من الكاميرا
else: # option == "كاميرا"
    picture = st.camera_input("التقط صورة بالكاميرا 🎥")

    if picture is not None:
        img = Image.open(picture).convert('RGB')
        img = np.array(img)
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        intensity = st.slider("اختاري شدة التحويل الكرتوني 🎨", 1, 10, 5)
        
        cartoon = spongebob_style(img, intensity)
        cartoon_rgb = cv2.cvtColor(cartoon, cv2.COLOR_BGR2RGB)

        st.image(cartoon_rgb, caption=f"🎨 صورتك بأسلوب SpongeBob (الدرجة: {intensity})", use_container_width=True)

        result_img = Image.fromarray(cartoon_rgb)
        buf = BytesIO()
        result_img.save(buf, format="PNG")
        byte_im = buf.getvalue()

        col_down1, col_down2, col_down3 = st.columns([1, 1, 1])
        with col_down2:
            st.download_button(
                label="⬇️ تحميل الصورة الناتجة",
                data=byte_im,
                file_name="spongebob_style.png",
                mime="image/png",
                use_container_width=True
            )