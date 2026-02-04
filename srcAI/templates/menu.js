/**
 * 選單互動腳本
 */

// 漢堡選單開關
const menuToggle = document.getElementById('menuToggle')
const mobileMenu = document.getElementById('mobileMenu')
const mobileMenuOverlay = document.getElementById('mobileMenuOverlay')

if (menuToggle) {
    menuToggle.addEventListener('click', function () {
        openMobileMenu()
    })
}

function openMobileMenu() {
    if (mobileMenu && mobileMenuOverlay) {
        mobileMenu.classList.remove('translate-x-full')
        mobileMenuOverlay.classList.remove('hidden')
        document.body.style.overflow = 'hidden'
    }
}

function closeMobileMenu() {
    if (mobileMenu && mobileMenuOverlay) {
        mobileMenu.classList.add('translate-x-full')
        mobileMenuOverlay.classList.add('hidden')
        document.body.style.overflow = ''
    }
}

// 樹狀選單展開/收合
function toggleMenu(button) {
    const li = button.closest('li')
    if (!li) return

    const childUl = li.querySelector(':scope > ul')
    const icon = button.querySelector('i')

    if (childUl) {
        childUl.classList.toggle('hidden')

        // 旋轉箭頭圖示
        if (icon) {
            if (childUl.classList.contains('hidden')) {
                icon.style.transform = 'rotate(0deg)'
            } else {
                icon.style.transform = 'rotate(90deg)'
            }
        }
    }
}

// 自動展開當前頁面的選單路徑
document.addEventListener('DOMContentLoaded', function () {
    // 找到所有 active 的選單項目
    const activeItems = document.querySelectorAll('.menu-item.active')

    activeItems.forEach(function (item) {
        // 向上遍歷展開所有父選單
        let parent = item.parentElement
        while (parent) {
            if (parent.tagName === 'UL' && parent.classList.contains('menu-children')) {
                parent.classList.remove('hidden')

                // 找到對應的 toggle 按鈕並旋轉箭頭
                const parentLi = parent.parentElement
                if (parentLi) {
                    const toggleBtn = parentLi.querySelector(':scope > div > .toggle-btn i')
                    if (toggleBtn) {
                        toggleBtn.style.transform = 'rotate(90deg)'
                    }
                }
            }
            parent = parent.parentElement
        }
    })
})

// 鍵盤 ESC 關閉選單
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        closeMobileMenu()
    }
})
