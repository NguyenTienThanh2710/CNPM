// Lấy tham số tìm kiếm từ URL
function getSearchParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    return {
        query: urlParams.get('q') || '',
        category: category ? [category] : [],
        priceRange: '',
        sortBy: 'relevance'
    };
}

// Khởi tạo trang tìm kiếm
async function initializeSearch() {
    const searchParams = getSearchParams();
    
    // Hiển thị từ khóa tìm kiếm
    const searchQuery = document.getElementById('search-query');
    searchQuery.textContent = searchParams.query ? searchParams.query : 'tất cả sản phẩm';
    
    // Cập nhật tiêu đề trang tìm kiếm
    document.title = `Kết quả tìm kiếm: ${searchParams.query || 'Tất cả sản phẩm'} - New Computer Store`;
    
    // Lấy và hiển thị kết quả tìm kiếm
    await performSearch(searchParams);
    
    // Khởi tạo các sự kiện cho bộ lọc
    initializeFilterEvents();
}

// Thực hiện tìm kiếm sản phẩm
async function performSearch(params) {
    try {
        // Gọi API tìm kiếm sản phẩm
        const response = await fetch(`/api/products/search?q=${encodeURIComponent(params.query)}`);
        if (!response.ok) {
            throw new Error('Failed to search products');
        }
        const products = await response.json();
        
        // Lọc sản phẩm theo danh mục
        let filteredProducts = products;
        if (params.category.length > 0) {
            filteredProducts = filteredProducts.filter(product => 
                params.category.includes(product.category)
            );
        }
        
        // Lọc sản phẩm theo giá
        if (params.priceRange) {
            const [minPrice, maxPrice] = params.priceRange.split('-').map(Number);
            filteredProducts = filteredProducts.filter(product => 
                product.price >= minPrice && product.price <= maxPrice
            );
        }
        
        // Sắp xếp sản phẩm
        switch (params.sortBy) {
            case 'price-asc':
                filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'name-asc':
                filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
                break;
        }
        
        // Hiển thị kết quả
        displaySearchResults(filteredProducts);
        
    } catch (error) {
        console.error('Error searching products:', error);
        showNoResults();
    }
}

// Hiển thị kết quả tìm kiếm
function displaySearchResults(products) {
    const resultsContainer = document.getElementById('search-results');
    const noResultsContainer = document.getElementById('no-results');
    const resultCount = document.getElementById('result-count');
    const searchParams = getSearchParams();
    const searchQuery = searchParams.query;
    
    // Cập nhật tiêu đề kết quả tìm kiếm
    document.getElementById('search-result-title').textContent = searchQuery ? `Kết quả tìm kiếm cho "${searchQuery}"` : 'Tất cả sản phẩm';
    
    if (products.length === 0) {
        resultsContainer.innerHTML = '';
        noResultsContainer.classList.remove('d-none');
        const searchType = searchParams.category.includes('laptop') ? 'laptop' : 'sản phẩm';
        resultCount.textContent = searchQuery ? `Không tìm thấy ${searchType} phù hợp với từ khóa "${searchQuery}"` : `Không tìm thấy ${searchType}`;
        return;
    }
    
    noResultsContainer.classList.add('d-none');
    resultCount.textContent = `${products.length} kết quả`;
    
    resultsContainer.innerHTML = products.map(product => `
        <div class="col">
            <div class="card h-100">
                <img src="${product.image || '/images/product-placeholder.jpg'}" 
                     class="card-img-top product-image" 
                     alt="${product.name}">
                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text text-danger fw-bold">
                        ${product.price.toLocaleString('vi-VN')}đ
                    </p>
                    <a href="/product-detail.html?id=${product.id}" 
                       class="btn btn-primary w-100">
                        Xem chi tiết
                    </a>
                </div>
            </div>
        </div>
    `).join('');
}

// Khởi tạo sự kiện cho các bộ lọc
function initializeFilterEvents() {
    // Sự kiện cho bộ lọc danh mục
    const categoryCheckboxes = document.querySelectorAll('input[type="checkbox"][id^="category-"]');
    categoryCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateFilters);
    });
    
    // Sự kiện cho bộ lọc giá
    document.getElementById('price-range').addEventListener('change', updateFilters);
    
    // Sự kiện cho sắp xếp
    document.getElementById('sort-by').addEventListener('change', updateFilters);
}

// Cập nhật bộ lọc và thực hiện tìm kiếm lại
function updateFilters() {
    const params = getSearchParams();
    
    // Cập nhật danh mục đã chọn
    const selectedCategories = Array.from(document.querySelectorAll('input[type="checkbox"][id^="category-"]:checked'))
        .map(checkbox => checkbox.value);
    params.category = selectedCategories;
    
    // Cập nhật khoảng giá
    params.priceRange = document.getElementById('price-range').value;
    
    // Cập nhật kiểu sắp xếp
    params.sortBy = document.getElementById('sort-by').value;
    
    // Thực hiện tìm kiếm lại
    performSearch(params);
}

// Khởi tạo trang khi tải xong
document.addEventListener('DOMContentLoaded', initializeSearch);