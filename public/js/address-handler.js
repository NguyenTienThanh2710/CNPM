// Khởi tạo và xử lý các dropdown địa chỉ
document.addEventListener('DOMContentLoaded', function() {
    if (!window.location.pathname.includes('/checkout.html')) return;

    const provinceSelect = document.getElementById('province');
    const districtSelect = document.getElementById('district');
    const wardSelect = document.getElementById('ward');

    if (!provinceSelect || !districtSelect || !wardSelect) {
        console.error('Không tìm thấy các phần tử select địa chỉ');
        return;
    }

    // Đảm bảo các select được khởi tạo với trạng thái mặc định
    districtSelect.disabled = true;
    wardSelect.disabled = true;

    // Khởi tạo các dropdown địa chỉ
    initializeAddressSelects();
});