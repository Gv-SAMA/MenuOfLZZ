// 初始菜单数据
let menuData = [
    { id: 1, name: "白米饭", price: 38, category: "主食" },
    { id: 2, name: "蛋炒饭", price: 38, category: "主食" },
    { id: 3, name: "面条", price: 38, category: "主食" },
    { id: 4, name: "馒头", price: 38, category: "主食" },
    { id: 5, name: "粥", price: 38, category: "主食" },
    { id: 6, name: "辣椒炒肉", price: 38, category: "炒菜" },
    { id: 7, name: "芹菜牛肉", price: 38, category: "炒菜" },
    { id: 8, name: "宫保鸡丁", price: 32, category: "炒菜" },
    { id: 9, name: "土豆炖牛肉", price: 38, category: "炖菜" },
    { id: 10, name: "酸辣汤", price: 18, category: "汤" },
    { id: 11, name: "炸鸡翅", price: 6, category: "小吃" },
    { id: 12, name: "薯条", price: 5, category: "小吃" },
    { id: 13, name: "可乐", price: 5, category: "饮料" },
    { id: 14, name: "啤酒", price: 8, category: "饮料" },
    { id: 15, name: "橙汁", price: 5, category: "饮料" },
    { id: 16, name: "雪碧", price: 5, category: "饮料" },
];

// 购物车数据
let cart = [];
let totalPrice = 0;

// DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    renderMenu();
    setupEventListeners();
    
    // 默认显示点菜标签页
    showTab('order-tab');
});

// 显示指定标签页
function showTab(tabId) {
    // 隐藏所有标签页
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 显示选中的标签页
    document.getElementById(tabId).classList.add('active');
    
    // 更新导航栏活动状态
    document.querySelectorAll('.nav-links li').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.tab === tabId) {
            item.classList.add('active');
        }
    });
    
    // 如果是点菜标签页，重新渲染菜单
    if (tabId === 'order-tab') {
        renderMenu();
    }
}

// 渲染菜单
function renderMenu(category = 'all') {
    const menuContainer = document.getElementById('menuItems');
    menuContainer.innerHTML = '';

    const filteredMenu = category === 'all' 
        ? menuData 
        : menuData.filter(item => item.category === category);

    filteredMenu.forEach(item => {
        const dishCard = document.createElement('div');
        dishCard.className = 'dish-card';
        dishCard.dataset.id = item.id;
        dishCard.innerHTML = `
            <h3>${item.name}</h3>
            <p>分类: ${item.category}</p>
            <p class="price">￥${item.price.toFixed(2)}</p>
            <button class="add-to-cart">加入订单</button>
        `;
        menuContainer.appendChild(dishCard);
    });

    // 为每个添加按钮绑定事件
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const dishId = parseInt(this.parentElement.dataset.id);
            addToCart(dishId);
        });
    });
}

// 添加菜品到购物车
function addToCart(dishId) {
    const dish = menuData.find(item => item.id === dishId);
    if (!dish) return;

    const existingItem = cart.find(item => item.id === dishId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...dish,
            quantity: 1
        });
    }

    updateCart();
}

// 更新购物车显示
function updateCart() {
    const cartItemsContainer = document.getElementById('cartItems');
    cartItemsContainer.innerHTML = '';

    totalPrice = 0;

    cart.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${item.name} × ${item.quantity}</span>
            <span>￥${(item.price * item.quantity).toFixed(2)}</span>
        `;
        cartItemsContainer.appendChild(li);
        totalPrice += item.price * item.quantity;
    });

    document.getElementById('totalPrice').textContent = totalPrice.toFixed(2);
    document.getElementById('cartCount').textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
}

// 设置事件监听器
function setupEventListeners() {
    // 导航栏标签切换
    document.querySelectorAll('.nav-links li').forEach(item => {
        item.addEventListener('click', function() {
            showTab(this.dataset.tab);
        });
    });

    // 添加新菜品表单提交
    document.getElementById('addDishForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('dishName').value;
        const price = parseFloat(document.getElementById('dishPrice').value);
        const category = document.getElementById('dishCategory').value;
        const description = document.getElementById('dishDescription').value;

        if (name && !isNaN(price)) {
            const newId = menuData.length > 0 ? Math.max(...menuData.map(item => item.id)) + 1 : 1;
            
            const newDish = {
                id: newId,
                name,
                price,
                category
            };
            
            if (description) {
                newDish.description = description;
            }
            
            menuData.push(newDish);

            // 清空表单
            this.reset();
            
            // 显示成功消息
            const message = document.getElementById('addDishMessage');
            message.textContent = `"${name}" 添加成功！`;
            message.style.color = 'green';
            
            // 3秒后消失
            setTimeout(() => {
                message.textContent = '';
            }, 3000);
        }
    });

    // 分类筛选
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            renderMenu(this.dataset.category);
        });
    });

    // 提交订单
    document.getElementById('submitOrder').addEventListener('click', function() {
        if (cart.length === 0) {
            alert('请先选择菜品！');
            return;
        }

        const modal = document.getElementById('orderModal');
        const orderResult = document.getElementById('orderResult');
        
        let orderHTML = '<ul>';
        cart.forEach(item => {
            orderHTML += `
                <li>
                    <strong>${item.name}</strong> - 
                    数量: ${item.quantity} - 
                    小计: ￥${(item.price * item.quantity).toFixed(2)}
                </li>
            `;
        });
        orderHTML += `</ul><p><strong>总计: ￥${totalPrice.toFixed(2)}</strong></p>`;
        
        orderResult.innerHTML = orderHTML;
        modal.style.display = 'block';
        
        // 清空购物车
        cart = [];
        updateCart();
    });

    // 关闭模态框
    document.querySelector('.close').addEventListener('click', function() {
        document.getElementById('orderModal').style.display = 'none';
    });

    // 点击模态框外部关闭
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('orderModal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}