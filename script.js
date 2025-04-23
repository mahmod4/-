// تهيئة الموقع وإضافة التفاعلات
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuBtn = document.querySelector('.mobile-menu');
    const nav = document.querySelector('nav');
    const header = document.querySelector('header');
    const overlay = document.querySelector('.overlay');
    
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
            toggleMenu();
        });
    }
    
    // فتح أو إغلاق القائمة الجانبية
    function toggleMenu() {
        isMenuOpen = !isMenuOpen; // تبديل حالة القائمة
        
        if (isMenuOpen) {
            nav.classList.add('active');
            overlay.classList.add('active');
            // تغيير أيقونة القائمة عند الفتح
            mobileMenuBtn.innerHTML = '<i class="fas fa-times"></i>';
            // منع التمرير في الصفحة
            document.body.style.overflow = 'hidden';
        } else {
            nav.classList.remove('active');
            overlay.classList.remove('active');
            // إعادة أيقونة القائمة الأصلية عند الإغلاق
            mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            // السماح بالتمرير في الصفحة
            document.body.style.overflow = '';
        }
    }
    
    // إغلاق القائمة عند النقر على الطبقة المظللة
    if (overlay) {
        overlay.addEventListener('click', function() {
            if (isMenuOpen) {
                toggleMenu();
            }
        });
    }
    
    // إغلاق القائمة عند النقر على أي مكان في الصفحة
    document.addEventListener('click', function(event) {
        const isClickInsideMenu = mobileMenuBtn.contains(event.target);
        const isClickInsideNav = nav.contains(event.target);
        
        if (!isClickInsideMenu && !isClickInsideNav && isMenuOpen) {
            toggleMenu();
        }
    });
    
    // إغلاق القائمة عند النقر على روابط القائمة
    document.querySelectorAll('nav ul li a').forEach(function(link) {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768 && isMenuOpen) {
                setTimeout(function() {
                    toggleMenu();
                }, 300); // تأخير بسيط للإغلاق بعد النقر
            }
        });
    });
    
    // مراقبة تغير حجم الشاشة
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            // إعادة أيقونة القائمة الأصلية
            mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
            
            // إعادة القائمة للوضع الافتراضي
            if (isMenuOpen) {
                nav.classList.remove('active');
                overlay.classList.remove('active');
                document.body.style.overflow = '';
                isMenuOpen = false;
            }
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
            toggleMenu();
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
                    toggleMenu();
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
                    toggleMenu();
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
        
        // إضافة تأثير متدرج للرابط النشط
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
                
                // إذا كانت القائمة مفتوحة، نقوم بتمرير الرابط النشط إلى منطقة الرؤية
                if (window.innerWidth <= 768 && isMenuOpen) {
                    setTimeout(() => {
                        link.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 300);
                }
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
        const touchElements = document.querySelectorAll('.knot-item, .fire-item, .social-icons a, .btn, nav ul li a');
        
        touchElements.forEach(element => {
            let touchStartTime;
            let touchStartX;
            let touchStartY;
            
            element.addEventListener('touchstart', function(e) {
                // تسجيل زمن بدء اللمس وموقعه
                touchStartTime = new Date().getTime();
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
                this.classList.add('touch-active');
            }, { passive: true });
            
            element.addEventListener('touchmove', function(e) {
                // إلغاء تأثير اللمس إذا تحرك الإصبع كثيراً
                const touchX = e.touches[0].clientX;
                const touchY = e.touches[0].clientY;
                const diffX = Math.abs(touchX - touchStartX);
                const diffY = Math.abs(touchY - touchStartY);
                
                // إذا تحرك الإصبع لأكثر من 10 بكسل، ألغِ تأثير اللمس
                if (diffX > 10 || diffY > 10) {
                    this.classList.remove('touch-active');
                }
            }, { passive: true });
            
            element.addEventListener('touchend', function() {
                // إزالة تأثير اللمس
                this.classList.remove('touch-active');
                
                // حساب مدة اللمس
                const touchDuration = new Date().getTime() - touchStartTime;
                
                // إذا كانت مدة اللمس قصيرة (أقل من 300 ميلي ثانية)، نعتبرها نقرة
                if (touchDuration < 300) {
                    // إضافة تأثير نقرة سريع
                    this.classList.add('touch-tap');
                    setTimeout(() => {
                        this.classList.remove('touch-tap');
                    }, 150);
                }
            }, { passive: true });
            
            element.addEventListener('touchcancel', function() {
                // إزالة جميع تأثيرات اللمس عند إلغاء اللمس
                this.classList.remove('touch-active');
                this.classList.remove('touch-tap');
            }, { passive: true });
        });
    }
});
