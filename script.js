// تهيئة الموقع وإضافة التفاعلات
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.querySelector('.mobile-menu');
    const nav = document.querySelector('nav');
    const header = document.querySelector('header');
    
    // متغيرات للتحكم في سلوك الهيدر عند التمرير
    let lastScrollTop = 0;
    let scrollDelta = 5;
    let headerHeight = header.offsetHeight;
    let isHeaderVisible = true;
    let isMenuOpen = false; // إضافة متغير لتتبع حالة القائمة
    
    // عند النقر على زر القائمة المتنقلة
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // منع انتشار الحدث
            isMenuOpen = !isMenuOpen; // تبديل حالة القائمة
            
            if (isMenuOpen) {
                nav.style.display = 'block';
                // تغيير أيقونة القائمة عند الفتح
                mobileMenuBtn.innerHTML = '<i class="fas fa-times"></i>';
            } else {
                nav.style.display = 'none';
                // إعادة أيقونة القائمة الأصلية عند الإغلاق
                mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    }
    
    // إغلاق القائمة عند النقر على أي مكان في الصفحة
    document.addEventListener('click', function(event) {
        const isClickInsideMenu = mobileMenuBtn.contains(event.target);
        const isClickInsideNav = nav.contains(event.target);
        
        if (!isClickInsideMenu && !isClickInsideNav && isMenuOpen) {
            nav.style.display = 'none';
            mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            isMenuOpen = false;
        }
    });
    
    // مراقبة تغير حجم الشاشة
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            nav.style.display = 'block';
            isMenuOpen = false;
            mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        } else if (!isMenuOpen) {
            nav.style.display = 'none';
        }
        
        // تحديث ارتفاع الهيدر عند تغيير حجم الشاشة
        headerHeight = header.offsetHeight;
    });
    
    // إضافة مراقبة التمرير لإظهار وإخفاء الهيدر
    window.addEventListener('scroll', function() {
        // تحسين الأداء عبر استخدام requestAnimationFrame
        requestAnimationFrame(function() {
            controlHeader();
        });
    });
    
    function controlHeader() {
        let currentScroll = window.pageYOffset || document.documentElement.scrollTop;
        
        // إغلاق القائمة المتنقلة عند التمرير لمسافة كبيرة
        if (currentScroll > 100 && isMenuOpen && window.innerWidth <= 768) {
            nav.style.display = 'none';
            mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            isMenuOpen = false;
        }
        
        // لا تفعل شيئًا إذا كان التمرير أقل من مقدار دلتا التمرير
        if(Math.abs(lastScrollTop - currentScroll) <= scrollDelta)
            return;
        
        // إذا كان التمرير لأسفل وتجاوز ارتفاع الهيدر، قم بإخفاء الهيدر
        if (currentScroll > lastScrollTop && currentScroll > headerHeight) {
            // التمرير لأسفل
            if (isHeaderVisible) {
                header.style.transform = 'translateY(-100%)';
                isHeaderVisible = false;
                
                // إغلاق القائمة المتنقلة عند إخفاء الهيدر
                if (isMenuOpen && window.innerWidth <= 768) {
                    nav.style.display = 'none';
                    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
                    isMenuOpen = false;
                }
            }
        } else {
            // التمرير لأعلى
            if (!isHeaderVisible) {
                header.style.transform = 'translateY(0)';
                isHeaderVisible = true;
            }
        }
        
        lastScrollTop = currentScroll;
    }
    
    // تحسين التمرير السلس للروابط الداخلية
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // إغلاق القائمة المتنقلة عند النقر على رابط
                if (window.innerWidth <= 768 && isMenuOpen) {
                    nav.style.display = 'none';
                    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
                    isMenuOpen = false;
                }
                
                // إضافة تأخير صغير للتمرير بعد إغلاق القائمة
                setTimeout(function() {
                    // التمرير إلى العنصر المستهدف
                    window.scrollTo({
                        top: targetElement.offsetTop - headerHeight - 10, // تعديل للتمرير بناءً على ارتفاع الهيدر مع هامش إضافي
                        behavior: 'smooth'
                    });
                }, 100);
            }
        });
    });
    
    // تحسين مؤشر القسم النشط في القائمة
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('nav ul li a');
    
    // تحديث القسم النشط عند التمرير
    function updateActiveSection() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - headerHeight - 100;
            const sectionHeight = section.clientHeight;
            
            if (pageYOffset >= sectionTop && pageYOffset < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }
    
    // تحديث القسم النشط عند التمرير
    window.addEventListener('scroll', function() {
        requestAnimationFrame(updateActiveSection);
    });
    
    // تحديث القسم النشط عند تحميل الصفحة
    updateActiveSection();
    
    // تحسين الرسوم المتحركة عند التمرير
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    };
    
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    // تطبيق الرسوم المتحركة على العناصر المرئية
    document.querySelectorAll('.box, .knot-item, .fire-item, .emblem-container').forEach(item => {
        observer.observe(item);
    });
    
    // إضافة دعم لمس للأجهزة المحمولة
    if ('ontouchstart' in window || navigator.maxTouchPoints) {
        const touchElements = document.querySelectorAll('.knot-item, .fire-item, .social-icons a, .btn');
        
        touchElements.forEach(element => {
            element.addEventListener('touchstart', function() {
                this.classList.add('touch-active');
            });
            
            element.addEventListener('touchend', function() {
                this.classList.remove('touch-active');
            });
        });
    }
});
