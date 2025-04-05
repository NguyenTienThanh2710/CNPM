const API_BASE_URL = 'https://provinces.open-api.vn/api';

// Lấy danh sách tỉnh/thành phố
async function getProvinces() {
    try {
        const response = await fetch(`${API_BASE_URL}/p/`);
        if (!response.ok) throw new Error('Không thể lấy danh sách tỉnh/thành phố');
        return await response.json();
    } catch (error) {
        console.error('Lỗi khi lấy danh sách tỉnh/thành phố:', error);
        alert('Có lỗi xảy ra khi lấy danh sách tỉnh/thành phố. Vui lòng thử lại.');
        return [];
    }
}

// Lấy danh sách quận/huyện theo tỉnh/thành phố
async function getDistricts(provinceCode) {
    try {
        const response = await fetch(`${API_BASE_URL}/p/${provinceCode}?depth=2`);
        if (!response.ok) throw new Error('Không thể lấy danh sách quận/huyện');
        const data = await response.json();
        return data.districts || [];
    } catch (error) {
        console.error('Lỗi khi lấy danh sách quận/huyện:', error);
        alert('Có lỗi xảy ra khi lấy danh sách quận/huyện. Vui lòng thử lại.');
        return [];
    }
}

// Lấy danh sách phường/xã theo quận/huyện
async function getWards(districtCode) {
    try {
        const response = await fetch(`${API_BASE_URL}/d/${districtCode}?depth=2`);
        if (!response.ok) throw new Error('Không thể lấy danh sách phường/xã');
        const data = await response.json();
        return data.wards || [];
    } catch (error) {
        console.error('Lỗi khi lấy danh sách phường/xã:', error);
        alert('Có lỗi xảy ra khi lấy danh sách phường/xã. Vui lòng thử lại.');
        return [];
    }
}

// Cập nhật các option cho select
function updateSelectOptions(selectElement, items, defaultText = 'Chọn...') {
    selectElement.innerHTML = `<option value="">${defaultText}</option>`;
    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item.code;
        option.textContent = item.name;
        selectElement.appendChild(option);
    });
}

// Khởi tạo các dropdown địa chỉ
async function initializeAddressSelects() {
    const provinceSelect = document.getElementById('province');
    const districtSelect = document.getElementById('district');
    const wardSelect = document.getElementById('ward');

    if (!provinceSelect || !districtSelect || !wardSelect) return;

    // Lấy và hiển thị danh sách tỉnh/thành phố
    const provinces = await getProvinces();
    updateSelectOptions(provinceSelect, provinces, 'Chọn tỉnh/thành phố');

    // Xử lý sự kiện khi chọn tỉnh/thành phố
    provinceSelect.addEventListener('change', async () => {
        districtSelect.value = '';
        wardSelect.value = '';
        
        if (provinceSelect.value) {
            const districts = await getDistricts(provinceSelect.value);
            updateSelectOptions(districtSelect, districts, 'Chọn quận/huyện');
            districtSelect.disabled = false;
        } else {
            districtSelect.innerHTML = '<option value="">Chọn quận/huyện</option>';
            wardSelect.innerHTML = '<option value="">Chọn phường/xã</option>';
            districtSelect.disabled = true;
            wardSelect.disabled = true;
        }
    });

    // Xử lý sự kiện khi chọn quận/huyện
    districtSelect.addEventListener('change', async () => {
        wardSelect.value = '';
        
        if (districtSelect.value) {
            const wards = await getWards(districtSelect.value);
            updateSelectOptions(wardSelect, wards, 'Chọn phường/xã');
            wardSelect.disabled = false;
        } else {
            wardSelect.innerHTML = '<option value="">Chọn phường/xã</option>';
            wardSelect.disabled = true;
        }
    });

    // Khởi tạo trạng thái ban đầu
    districtSelect.disabled = true;
    wardSelect.disabled = true;
}

// Khởi tạo khi trang đã tải
document.addEventListener('DOMContentLoaded', () => {
    initializeAddressSelects();
});
