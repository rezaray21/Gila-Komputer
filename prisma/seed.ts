import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const productTemplates = [
  { name: 'RTX 4070 Super 12GB', slug: 'rtx-4070-super-12gb', description: 'Grafis 1440p untuk gaming dan kreasi visual', price: 10500000, stock: 8, category: 'VGA', specs: { GPU: 'RTX 4070 Super', VRAM: '12GB GDDR6X', TDP: '220W' } },
  { name: 'Radeon RX 7800 XT 16GB', slug: 'radeon-rx-7800-xt-16gb', description: 'Performa raster kuat dengan memori besar', price: 9200000, stock: 7, category: 'VGA', specs: { GPU: 'RX 7800 XT', VRAM: '16GB GDDR6', TDP: '263W' } },
  { name: 'RTX 4060 8GB Dual Fan', slug: 'rtx-4060-8gb-dual-fan', description: 'GPU efisien untuk gaming 1080p modern', price: 5200000, stock: 12, category: 'VGA', specs: { GPU: 'RTX 4060', VRAM: '8GB GDDR6', TDP: '115W' } },
  { name: 'Intel Core i7-14700K', slug: 'intel-core-i7-14700k', description: 'Performa hybrid untuk editing dan multitasking', price: 6800000, stock: 9, category: 'Processor', specs: { Cores: '20C/28T', Base: '3.4GHz', Socket: 'LGA1700' } },
  { name: 'AMD Ryzen 7 7800X3D', slug: 'amd-ryzen-7-7800x3d', description: 'Processor gaming dengan cache ekstra', price: 6500000, stock: 10, category: 'Processor', specs: { Cores: '8C/16T', Boost: '5.0GHz', Socket: 'AM5' } },
  { name: 'AMD Ryzen 5 7600', slug: 'amd-ryzen-5-7600', description: 'Fondasi AM5 seimbang untuk gaming harian', price: 3300000, stock: 14, category: 'Processor', specs: { Cores: '6C/12T', Boost: '5.1GHz', Socket: 'AM5' } },
  { name: 'Core i5-12400F', slug: 'core-i5-12400f', description: 'Value processor untuk build produktif', price: 2300000, stock: 16, category: 'Processor', specs: { Cores: '6C/12T', Base: '2.5GHz', Socket: 'LGA1700' } },
  { name: 'Vengeance 32GB DDR5 6000', slug: 'vengeance-32gb-ddr5-6000', description: 'Kit memori cepat untuk build generasi baru', price: 1750000, stock: 18, category: 'RAM', specs: { Capacity: '32GB', Speed: '6000MT/s', Type: 'DDR5' } },
  { name: 'Fury Beast 16GB DDR5 5200', slug: 'fury-beast-16gb-ddr5-5200', description: 'Memori DDR5 ringkas untuk kebutuhan harian', price: 950000, stock: 22, category: 'RAM', specs: { Capacity: '16GB', Speed: '5200MT/s', Type: 'DDR5' } },
  { name: 'Ripjaws V 32GB DDR4 3600', slug: 'ripjaws-v-32gb-ddr4-3600', description: 'Upgrade kapasitas untuk workstation DDR4', price: 1350000, stock: 20, category: 'RAM', specs: { Capacity: '32GB', Speed: '3600MT/s', Type: 'DDR4' } },
  { name: 'NVMe Gen4 2TB Performance', slug: 'nvme-gen4-2tb-performance', description: 'Storage cepat untuk project besar dan game', price: 2400000, stock: 11, category: 'Storage', specs: { Capacity: '2TB', Interface: 'PCIe 4.0', Read: '7400MB/s' } },
  { name: 'NVMe Gen3 1TB Essential', slug: 'nvme-gen3-1tb-essential', description: 'Boot drive cepat untuk build seimbang', price: 950000, stock: 25, category: 'Storage', specs: { Capacity: '1TB', Interface: 'PCIe 3.0', Read: '3500MB/s' } },
  { name: 'SATA SSD 1TB Quiet', slug: 'sata-ssd-1tb-quiet', description: 'Upgrade praktis untuk sistem lama', price: 850000, stock: 19, category: 'Storage', specs: { Capacity: '1TB', Interface: 'SATA III', Read: '560MB/s' } },
  { name: 'B550M WiFi Creator', slug: 'b550m-wifi-creator', description: 'Motherboard AM4 dengan konektivitas lengkap', price: 1850000, stock: 8, category: 'Motherboard', specs: { Chipset: 'B550', Socket: 'AM4', Wireless: 'WiFi 6' } },
  { name: 'B650M Pro WiFi', slug: 'b650m-pro-wifi', description: 'Fondasi AM5 modern untuk upgrade panjang', price: 2850000, stock: 7, category: 'Motherboard', specs: { Chipset: 'B650', Socket: 'AM5', Wireless: 'WiFi 6E' } },
  { name: 'Z790 DDR5 Creator', slug: 'z790-ddr5-creator', description: 'Platform Intel premium untuk workstation', price: 4900000, stock: 5, category: 'Motherboard', specs: { Chipset: 'Z790', Socket: 'LGA1700', Memory: 'DDR5' } },
  { name: '650W Gold Modular', slug: '650w-gold-modular', description: 'Daya efisien untuk build performa menengah', price: 1450000, stock: 13, category: 'Power', specs: { Wattage: '650W', Efficiency: '80+ Gold', Modular: 'Full' } },
  { name: '750W Gold ATX 3.0', slug: '750w-gold-atx-3', description: 'Power supply siap untuk GPU generasi baru', price: 1950000, stock: 10, category: 'Power', specs: { Wattage: '750W', Efficiency: '80+ Gold', Standard: 'ATX 3.0' } },
  { name: '850W Platinum Modular', slug: '850w-platinum-modular', description: 'Cadangan daya stabil untuk workstation besar', price: 2850000, stock: 6, category: 'Power', specs: { Wattage: '850W', Efficiency: '80+ Platinum', Modular: 'Full' } },
  { name: '550W Bronze Quiet', slug: '550w-bronze-quiet', description: 'Pilihan tenang untuk PC harian hemat daya', price: 950000, stock: 17, category: 'Power', specs: { Wattage: '550W', Efficiency: '80+ Bronze', Fan: 'Quiet 120mm' } },
]

const additionalProducts = [
  { name: 'RTX 4090 24GB Founders', slug: 'rtx-4090-24gb-founders', description: 'Performa ekstrem untuk 4K, AI, dan rendering berat', price: 28500000, stock: 3, category: 'VGA', specs: { GPU: 'RTX 4090', VRAM: '24GB GDDR6X', TDP: '450W' } },
  { name: 'RTX 4080 Super 16GB', slug: 'rtx-4080-super-16gb', description: 'Gaming 4K dengan ray tracing generasi baru', price: 18500000, stock: 4, category: 'VGA', specs: { GPU: 'RTX 4080 Super', VRAM: '16GB GDDR6X', TDP: '320W' } },
  { name: 'RTX 4070 Ti Super 16GB', slug: 'rtx-4070-ti-super-16gb', description: 'Kelas atas untuk 1440p dan 4K yang mulus', price: 13800000, stock: 6, category: 'VGA', specs: { GPU: 'RTX 4070 Ti Super', VRAM: '16GB GDDR6X', TDP: '285W' } },
  { name: 'RTX 4060 Ti 8GB', slug: 'rtx-4060-ti-8gb', description: 'GPU efisien untuk gaming modern dan streaming', price: 6500000, stock: 9, category: 'VGA', specs: { GPU: 'RTX 4060 Ti', VRAM: '8GB GDDR6', TDP: '160W' } },
  { name: 'RX 7900 XTX 24GB', slug: 'rx-7900-xtx-24gb', description: 'Rasterisasi kelas enthusiast dengan VRAM besar', price: 17200000, stock: 3, category: 'VGA', specs: { GPU: 'RX 7900 XTX', VRAM: '24GB GDDR6', TDP: '355W' } },
  { name: 'RX 7700 XT 12GB', slug: 'rx-7700-xt-12gb', description: 'Performa 1440p seimbang dengan harga kompetitif', price: 7200000, stock: 7, category: 'VGA', specs: { GPU: 'RX 7700 XT', VRAM: '12GB GDDR6', TDP: '245W' } },
  { name: 'RX 7600 8GB', slug: 'rx-7600-8gb', description: 'Pilihan hemat untuk gaming 1080p', price: 4300000, stock: 11, category: 'VGA', specs: { GPU: 'RX 7600', VRAM: '8GB GDDR6', TDP: '165W' } },
  { name: 'Intel Core i9-14900K', slug: 'intel-core-i9-14900k', description: 'Processor flagship untuk workstation dan kreator', price: 9800000, stock: 4, category: 'Processor', specs: { Cores: '24C/32T', Base: '3.2GHz', Socket: 'LGA1700' } },
  { name: 'Intel Core i7-14700', slug: 'intel-core-i7-14700', description: 'Multitasking kuat tanpa kebutuhan overclocking', price: 6100000, stock: 7, category: 'Processor', specs: { Cores: '20C/28T', Base: '2.1GHz', Socket: 'LGA1700' } },
  { name: 'Intel Core i5-14600K', slug: 'intel-core-i5-14600k-seeded', description: 'Performa gaming dan editing kelas menengah atas', price: 5200000, stock: 10, category: 'Processor', specs: { Cores: '14C/20T', Base: '3.5GHz', Socket: 'LGA1700' } },
  { name: 'AMD Ryzen 9 7950X', slug: 'amd-ryzen-9-7950x', description: '16 core untuk render, compile, dan simulasi berat', price: 9500000, stock: 4, category: 'Processor', specs: { Cores: '16C/32T', Boost: '5.7GHz', Socket: 'AM5' } },
  { name: 'AMD Ryzen 9 7900X', slug: 'amd-ryzen-9-7900x', description: 'Performa workstation AM5 yang fleksibel', price: 7800000, stock: 5, category: 'Processor', specs: { Cores: '12C/24T', Boost: '5.6GHz', Socket: 'AM5' } },
  { name: 'AMD Ryzen 5 5600', slug: 'amd-ryzen-5-5600', description: 'Value gaming populer untuk platform AM4', price: 1900000, stock: 14, category: 'Processor', specs: { Cores: '6C/12T', Boost: '4.4GHz', Socket: 'AM4' } },
  { name: 'AMD Ryzen 5 8500G', slug: 'amd-ryzen-5-8500g', description: 'Processor AM5 dengan grafis terintegrasi', price: 2800000, stock: 8, category: 'Processor', specs: { Cores: '6C/12T', Boost: '5.0GHz', Socket: 'AM5' } },
  { name: 'Vengeance 64GB DDR5 6000', slug: 'vengeance-64gb-ddr5-6000', description: 'Kapasitas besar untuk editing dan virtual machine', price: 3300000, stock: 8, category: 'RAM', specs: { Capacity: '64GB', Speed: '6000MT/s', Type: 'DDR5' } },
  { name: 'Trident Z5 32GB DDR5 6400', slug: 'trident-z5-32gb-ddr5-6400', description: 'Memori premium berlatensi rendah', price: 2100000, stock: 6, category: 'RAM', specs: { Capacity: '32GB', Speed: '6400MT/s', Type: 'DDR5' } },
  { name: 'Fury Beast 32GB DDR4 3200', slug: 'fury-beast-32gb-ddr4-3200', description: 'Upgrade RAM besar untuk platform DDR4', price: 1250000, stock: 16, category: 'RAM', specs: { Capacity: '32GB', Speed: '3200MT/s', Type: 'DDR4' } },
  { name: 'Vengeance 16GB DDR4 3200', slug: 'vengeance-16gb-ddr4-3200', description: 'Memori harian yang stabil dan terjangkau', price: 700000, stock: 20, category: 'RAM', specs: { Capacity: '16GB', Speed: '3200MT/s', Type: 'DDR4' } },
  { name: 'Kingston Fury 16GB DDR5 5600', slug: 'kingston-fury-16gb-ddr5-5600', description: 'Memori DDR5 entry-level untuk build modern', price: 850000, stock: 18, category: 'RAM', specs: { Capacity: '16GB', Speed: '5600MT/s', Type: 'DDR5' } },
  { name: 'NVMe Gen4 4TB Creator', slug: 'nvme-gen4-4tb-creator', description: 'Ruang besar untuk footage dan project kreatif', price: 4800000, stock: 5, category: 'Storage', specs: { Capacity: '4TB', Interface: 'PCIe 4.0', Read: '7400MB/s' } },
  { name: 'NVMe Gen4 1TB Speed', slug: 'nvme-gen4-1tb-speed', description: 'Storage cepat untuk OS dan game', price: 1350000, stock: 15, category: 'Storage', specs: { Capacity: '1TB', Interface: 'PCIe 4.0', Read: '5000MB/s' } },
  { name: 'NVMe Gen3 2TB Archive', slug: 'nvme-gen3-2tb-archive', description: 'Kapasitas lega untuk koleksi dan project', price: 1750000, stock: 10, category: 'Storage', specs: { Capacity: '2TB', Interface: 'PCIe 3.0', Read: '3500MB/s' } },
  { name: 'SATA SSD 480GB Basic', slug: 'sata-ssd-480gb-basic', description: 'Upgrade cepat untuk komputer lama', price: 550000, stock: 25, category: 'Storage', specs: { Capacity: '480GB', Interface: 'SATA III', Read: '520MB/s' } },
  { name: 'HDD 4TB Data Vault', slug: 'hdd-4tb-data-vault', description: 'Penyimpanan data besar dengan biaya efisien', price: 1550000, stock: 12, category: 'Storage', specs: { Capacity: '4TB', Interface: 'SATA III', Speed: '5400RPM' } },
  { name: 'X670E Creator WiFi', slug: 'x670e-creator-wifi', description: 'Motherboard AM5 premium untuk workstation', price: 6200000, stock: 3, category: 'Motherboard', specs: { Chipset: 'X670E', Socket: 'AM5', Memory: 'DDR5', Wireless: 'WiFi 6E' } },
  { name: 'B760M DDR5 Gaming', slug: 'b760m-ddr5-gaming', description: 'Platform Intel modern untuk gaming', price: 2400000, stock: 8, category: 'Motherboard', specs: { Chipset: 'B760', Socket: 'LGA1700', Memory: 'DDR5', Wireless: 'WiFi 6' } },
  { name: 'B550 Gaming Plus', slug: 'b550-gaming-plus', description: 'Motherboard AM4 dengan fitur gaming lengkap', price: 2100000, stock: 7, category: 'Motherboard', specs: { Chipset: 'B550', Socket: 'AM4', Memory: 'DDR4', Wireless: 'None' } },
  { name: 'H610M Office', slug: 'h610m-office', description: 'Platform Intel hemat untuk komputer kerja', price: 1350000, stock: 12, category: 'Motherboard', specs: { Chipset: 'H610', Socket: 'LGA1700', Memory: 'DDR4', Wireless: 'None' } },
  { name: '1000W Platinum ATX 3.0', slug: '1000w-platinum-atx-3', description: 'Daya besar untuk GPU dan workstation kelas atas', price: 3900000, stock: 4, category: 'Power', specs: { Wattage: '1000W', Efficiency: '80+ Platinum', Standard: 'ATX 3.0' } },
  { name: '850W Gold ATX 3.0', slug: '850w-gold-atx-3', description: 'PSU modern untuk build enthusiast', price: 2550000, stock: 7, category: 'Power', specs: { Wattage: '850W', Efficiency: '80+ Gold', Standard: 'ATX 3.0' } },
  { name: '750W Bronze Modular', slug: '750w-bronze-modular', description: 'Pilihan modular terjangkau untuk gaming', price: 1350000, stock: 12, category: 'Power', specs: { Wattage: '750W', Efficiency: '80+ Bronze', Modular: 'Semi' } },
  { name: '450W Bronze Office', slug: '450w-bronze-office', description: 'Daya hemat untuk komputer tanpa GPU besar', price: 650000, stock: 18, category: 'Power', specs: { Wattage: '450W', Efficiency: '80+ Bronze', Modular: 'None' } },
  { name: 'Air Cooler Dual Tower 120', slug: 'air-cooler-dual-tower-120', description: 'Pendingin senyap untuk processor performa tinggi', price: 950000, stock: 10, category: 'CPU Cooler', specs: { Socket: 'AM4/AM5/LGA1700', Height: '158mm', TDP: '250W' } },
  { name: 'Air Cooler Tower 120', slug: 'air-cooler-tower-120', description: 'Pendingin tower seimbang untuk gaming harian', price: 550000, stock: 15, category: 'CPU Cooler', specs: { Socket: 'AM4/AM5/LGA1700', Height: '155mm', TDP: '180W' } },
  { name: 'AIO Liquid Cooler 240', slug: 'aio-liquid-cooler-240', description: 'Pendingin cair ringkas untuk CPU panas', price: 1450000, stock: 8, category: 'CPU Cooler', specs: { Socket: 'AM4/AM5/LGA1700', Radiator: '240mm', TDP: '280W' } },
  { name: 'AIO Liquid Cooler 360', slug: 'aio-liquid-cooler-360', description: 'Pendinginan maksimal untuk workstation', price: 2200000, stock: 5, category: 'CPU Cooler', specs: { Socket: 'AM4/AM5/LGA1700', Radiator: '360mm', TDP: '320W' } },
  { name: 'Low Profile Cooler 65W', slug: 'low-profile-cooler-65w', description: 'Pendingin ringkas untuk case kecil', price: 350000, stock: 12, category: 'CPU Cooler', specs: { Socket: 'AM4/AM5/LGA1700', Height: '55mm', TDP: '65W' } },
  { name: 'Tower Cooler ARGB', slug: 'tower-cooler-argb', description: 'Pendingin tower dengan pencahayaan ARGB', price: 700000, stock: 11, category: 'CPU Cooler', specs: { Socket: 'AM4/AM5/LGA1700', Height: '160mm', TDP: '220W' } },
  { name: 'Mid Tower Airflow Mesh', slug: 'mid-tower-airflow-mesh', description: 'Casing mesh dengan sirkulasi udara lega', price: 850000, stock: 10, category: 'Case', specs: { Form: 'ATX/mATX', GPUClearance: '380mm', CoolerHeight: '165mm' } },
  { name: 'Compact mATX Mesh', slug: 'compact-matx-mesh', description: 'Casing ringkas untuk build mATX', price: 650000, stock: 13, category: 'Case', specs: { Form: 'mATX/ITX', GPUClearance: '330mm', CoolerHeight: '160mm' } },
  { name: 'Panoramic Glass Mid Tower', slug: 'panoramic-glass-mid-tower', description: 'Casing showcase dengan panel kaca luas', price: 1200000, stock: 7, category: 'Case', specs: { Form: 'ATX/mATX', GPUClearance: '400mm', CoolerHeight: '170mm' } },
  { name: 'Mini ITX Creator Case', slug: 'mini-itx-creator-case', description: 'Casing mini untuk workstation hemat ruang', price: 1550000, stock: 5, category: 'Case', specs: { Form: 'ITX', GPUClearance: '320mm', CoolerHeight: '145mm' } },
  { name: 'Full Tower Workstation', slug: 'full-tower-workstation', description: 'Casing besar untuk banyak storage dan radiator', price: 2300000, stock: 4, category: 'Case', specs: { Form: 'EATX/ATX', GPUClearance: '450mm', CoolerHeight: '190mm' } },
  { name: 'Silent Mid Tower', slug: 'silent-mid-tower', description: 'Casing peredam suara untuk ruang kerja', price: 1350000, stock: 6, category: 'Case', specs: { Form: 'ATX/mATX', GPUClearance: '370mm', CoolerHeight: '165mm' } },
  { name: 'PWM Fan 120mm 3-Pack', slug: 'pwm-fan-120mm-3-pack', description: 'Tiga kipas PWM untuk airflow lebih teratur', price: 450000, stock: 15, category: 'Fan', specs: { Size: '120mm', Quantity: '3', Connector: '4-pin PWM' } },
  { name: 'ARGB Fan 120mm 3-Pack', slug: 'argb-fan-120mm-3-pack', description: 'Kipas ARGB untuk airflow dan tampilan build', price: 650000, stock: 12, category: 'Fan', specs: { Size: '120mm', Quantity: '3', Connector: '4-pin PWM/3-pin ARGB' } },
  { name: 'Quiet Fan 140mm 2-Pack', slug: 'quiet-fan-140mm-2-pack', description: 'Kipas besar yang tenang untuk casing', price: 500000, stock: 10, category: 'Fan', specs: { Size: '140mm', Quantity: '2', Connector: '4-pin PWM' } },
  { name: 'High Pressure Fan 120mm', slug: 'high-pressure-fan-120mm', description: 'Kipas tekanan tinggi untuk radiator', price: 250000, stock: 18, category: 'Fan', specs: { Size: '120mm', Quantity: '1', Connector: '4-pin PWM' } },
  { name: '27 inch 1440p 165Hz', slug: 'monitor-27-1440p-165hz', description: 'Monitor gaming tajam dengan refresh rate tinggi', price: 4200000, stock: 7, category: 'Monitor', specs: { Size: '27 inch', Resolution: '2560x1440', Refresh: '165Hz' } },
  { name: '24 inch 1080p 180Hz', slug: 'monitor-24-1080p-180hz', description: 'Monitor kompetitif cepat untuk gaming esports', price: 2300000, stock: 10, category: 'Monitor', specs: { Size: '24 inch', Resolution: '1920x1080', Refresh: '180Hz' } },
  { name: '32 inch 4K Creator', slug: 'monitor-32-4k-creator', description: 'Layar luas dan detail untuk pekerjaan kreatif', price: 6500000, stock: 4, category: 'Monitor', specs: { Size: '32 inch', Resolution: '3840x2160', Refresh: '60Hz' } },
  { name: '24 inch IPS Office', slug: 'monitor-24-ips-office', description: 'Monitor IPS nyaman untuk kerja dan belajar', price: 1650000, stock: 14, category: 'Monitor', specs: { Size: '24 inch', Resolution: '1920x1080', Refresh: '75Hz' } },
  { name: 'Mechanical Keyboard TKL', slug: 'mechanical-keyboard-tkl', description: 'Keyboard mekanikal ringkas untuk gaming dan kerja', price: 850000, stock: 12, category: 'Keyboard', specs: { Layout: 'TKL', Switch: 'Mechanical Red', Connection: 'USB-C' } },
  { name: 'Mechanical Keyboard Fullsize', slug: 'mechanical-keyboard-fullsize', description: 'Keyboard mekanikal lengkap dengan numpad', price: 1050000, stock: 9, category: 'Keyboard', specs: { Layout: 'Fullsize', Switch: 'Mechanical Brown', Connection: 'USB-C' } },
  { name: 'Slim Wireless Keyboard', slug: 'slim-wireless-keyboard', description: 'Keyboard wireless minimalis untuk meja kerja', price: 450000, stock: 15, category: 'Keyboard', specs: { Layout: 'Fullsize', Switch: 'Membrane', Connection: 'Wireless' } },
  { name: 'Gaming Mouse 26K DPI', slug: 'gaming-mouse-26k-dpi', description: 'Mouse ringan dengan sensor presisi tinggi', price: 750000, stock: 14, category: 'Mouse', specs: { Sensor: '26000 DPI', Connection: 'Wireless/USB', Weight: '62g' } },
  { name: 'Ergonomic Wireless Mouse', slug: 'ergonomic-wireless-mouse', description: 'Mouse nyaman untuk kerja berjam-jam', price: 550000, stock: 16, category: 'Mouse', specs: { Sensor: '4000 DPI', Connection: 'Wireless', Weight: '88g' } },
  { name: 'Essential USB Mouse', slug: 'essential-usb-mouse', description: 'Mouse sederhana untuk komputer harian', price: 150000, stock: 25, category: 'Mouse', specs: { Sensor: '1600 DPI', Connection: 'USB', Weight: '95g' } },
]

const selectedAdditionalSlugs = new Set([
  'rtx-4090-24gb-founders',
  'rtx-4080-super-16gb',
  'rtx-4070-ti-super-16gb',
  'rx-7900-xtx-24gb',
  'intel-core-i9-14900k',
  'intel-core-i7-14700',
  'amd-ryzen-9-7950x',
  'amd-ryzen-5-5600',
  'vengeance-64gb-ddr5-6000',
  'trident-z5-32gb-ddr5-6400',
  'fury-beast-32gb-ddr4-3200',
  'nvme-gen4-4tb-creator',
  'nvme-gen4-1tb-speed',
  'hdd-4tb-data-vault',
  'x670e-creator-wifi',
  'b760m-ddr5-gaming',
  '1000w-platinum-atx-3',
  '850w-gold-atx-3',
  'air-cooler-dual-tower-120',
  'aio-liquid-cooler-240',
  'aio-liquid-cooler-360',
  'mid-tower-airflow-mesh',
  'panoramic-glass-mid-tower',
  'mini-itx-creator-case',
  'pwm-fan-120mm-3-pack',
  'argb-fan-120mm-3-pack',
  'monitor-27-1440p-165hz',
  'monitor-32-4k-creator',
  'mechanical-keyboard-tkl',
  'gaming-mouse-26k-dpi',
])
const seedProducts = [...productTemplates, ...additionalProducts.filter(({ slug }) => selectedAdditionalSlugs.has(slug))]

const productImages: Record<string, string> = {
  'rtx-4070-super-12gb': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSP06Y09zA-ASH_rHfp3hg_UZn8y5lUOwYeo11STfLOZw&s=10',
  'radeon-rx-7800-xt-16gb': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQCOjqKj69_4DLbaB76Jfu4u304KEd6liay0BiWSWUSTQ&s=10',
  'rtx-4060-8gb-dual-fan': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9Pk4_ZOP7TjnF5EV465Zim7sZ8-cqeG1mtmdEQ5-61w&s=10',
  'intel-core-i7-14700k': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTis1CicFcqzuu-cRa_r5QA8PI5Fobx882BdHr1YOGZfg&s=10',
  'amd-ryzen-7-7800x3d': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTaU9vLysK1qVC59rOsZ3b3k_AWUWgMmF8-e5VlsQr0OA&s=10',
  'amd-ryzen-5-7600': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTaIYcItf0tXbpAogckji2tyQZf0RTnZwPWgvmHaES9DA&s=10',
  'core-i5-12400f': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmT5N-ZOXp-HFQTikW-kPQh8WvoUH8BFfEkEhSvVPx6w&s=10',
  'vengeance-32gb-ddr5-6000': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqaijOQ6GCM3hwFzmv8dxruVYgS_CgMPYRlu8PfzlyEw&s=10',
  'fury-beast-16gb-ddr5-5200': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTZuoCZaR3KCDWmOKHxhRQj-04zi2U71jSQTxHpTZ4nw&s=10',
  'ripjaws-v-32gb-ddr4-3600': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEGsU3pyN-Gg2pN7UKq18Jhdp3yjWGmhRoFlcfDgghUw&s=10',
  'nvme-gen4-2tb-performance': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSeMic2W4rPCrNtVpNvY9Zoi8uZNPoV80MvQB12gST3AA&s=10',
  'nvme-gen3-1tb-essential': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQEnAc0BXjnM_2FRHgp6TTlCO5XB9TMKg2cR0l6DYfTow&s=10',
  'sata-ssd-1tb-quiet': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5VOYsbRXUTTPwec4z7NSacTwb-xob_2R1jseBG31yzw&s',
  'b550m-wifi-creator': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTY6inBiU-2B3av3Yp8HbPP43_K8Xp7pfeGaMmyYQHR8A&s=10',
  'b650m-pro-wifi': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTLqi2EzzLGG3POGRq9kJGgqTmX5qZcbRd5OsjF8DqVw&s=10',
  'z790-ddr5-creator': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJvNNiXM-Sb4gSANWeOVvI8KlXMkxu8M0e76gy-xHYWA&s=10',
  '650w-gold-modular': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFEFINqxosx8y-F1gTjE0N7WWqBXoAwwqGp3kRcoqXAQ&s',
  '750w-gold-atx-3': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSs9vkj6S_Pra7pAsvlSIOcuxHz2g39XNxtUE9kuE-ng&s',
  '850w-platinum-modular': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5MhwmcupFsBGSrv47lymp1bzprjxRLOysgeX3Ad2ILg&s=10',
  '550w-bronze-quiet': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTN_CwrwlzfY5IMFC5k1w29NASnnZHW41rR--9vr83_DA&s=10',
  'rtx-4090-24gb-founders': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRt3HHYRn0D9-Isx8VcSwyrgQqU8JdopLZv64KQj1lPlw&s=10',
  'rtx-4080-super-16gb': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSN3m4Fdkeg3JVwsjwCScBqNw50UR8M9-7Rl6rmeFH3bQ&s=10',
  'rtx-4070-ti-super-16gb': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJrlB9oxekYUuwulA40DDauiSKQw1-yY2M1yhhRT3Cjg&s=10',
  'rx-7900-xtx-24gb': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7OHbG0mPGW88T7iRMpiVfgYlswH6RmW9XqUCLWz_TgQ&s=10',
  'intel-core-i9-14900k': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyBuxXKjyXgLtYeepyXYr34gM0rUI-8SDBDvzC0cONCQ&s=10',
  'intel-core-i7-14700': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRiGy4069IUmc7cqKdYR_hJIikqhgspKd9x6jO3nxDXCQ&s=10',
  'amd-ryzen-9-7950x': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAIP1C1BbOrok2taPv0CFOzDvgc0XKDM490tOo-f0aHg&s=10',
  'amd-ryzen-5-5600': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyB239AWlY_DtsKU3ao5HYk8hcKjN8-qaYYYVO2DuaOw&s',
  'vengeance-64gb-ddr5-6000': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_NqZjntV34dmXxWrBt2fbG7LsrMz0s7gxsNce9-J9sg&s=10',
  'trident-z5-32gb-ddr5-6400': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQpWzNlPBB0eBNwKIEZl7zWO4fcp9qoOwPc9C6l2SDfA&s=10',
  'fury-beast-32gb-ddr4-3200': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5P8Fg_lAncSpu-bJkRpiyPF27o8OxEzPhHNP6F63Wtg&s=10',
  'nvme-gen4-4tb-creator': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSlokIj3cTF8Yv8cjbJSGQBTjKwyFN1VQyrqUfPYO9hVg&s=10',
  'nvme-gen4-1tb-speed': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYzCBL6CWKc0y48vC4CNubq_ZiCXw2gERvryPZi5JJJg&s=10',
  'hdd-4tb-data-vault': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSlFyHGAR2BcJWbGjEgTgw-1YKwo_vVYqWm37l0IEhCFg&s=10',
  'x670e-creator-wifi': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnulBdEHJPeUSsA8PimM2VSlm8iC8JQUwScWytw8Ofkg&s=10',
  'b760m-ddr5-gaming': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLAKOZ4xJPKH4Z_r-bYuYeVWqaM16VCei_n0v6TPvq3g&s=10',
  '1000w-platinum-atx-3': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmiZlMDl6lLLLTmwhbsFX0cBL-5c5y1E0rZjP27Q3ZJg&s=10',
  '850w-gold-atx-3': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxz2ust77UbXHHxgMkJpFdv9aA-AtD4GuVPUF0gZOtNQ&s=10',
  'air-cooler-dual-tower-120': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSml-xZFCzMZtjpCCFAKgI_t0ZvtOnQudmz4Rv-mVsv6g&s',
  'aio-liquid-cooler-240': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2MDkLspzl1qzb5Rv0iYqgzGkJnMg-hDoSSeW1hVQ9xA&s=10',
  'aio-liquid-cooler-360': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmSEGpwBuJdj2G1e8K81e1EgfEBlRf0VOJtarVxcrZTQ&s',
  'mid-tower-airflow-mesh': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_KYMNrdQW3aKLZMOX_gcQ9STR4wxGX99qnUY1stPmsg&s=10',
  'panoramic-glass-mid-tower': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrY_2vcgXSOANIfhxBp7f-QpoDOA-iK8MnGdOg-vE0eg&s=10',
  'mini-itx-creator-case': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYKZD15OCmoR6_uxADHxvNekZYgMD-zNpBwry4Z74Nbg&s=10',
  'pwm-fan-120mm-3-pack': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwo2Fx7bpa-kAiKdgF26HdLkmQ0Unkt7q6ZDX7VS-uaw&s',
  'argb-fan-120mm-3-pack': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTBG5wmSFXHlXrg5xIqHrbF4oemLBSG5nFs01K_E53_PA&s=10',
  'monitor-27-1440p-165hz': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDZDSMDds9ckIbUWpQqFdOWpT6r0CxXrySVkEDANuCCw&s=10',
  'monitor-32-4k-creator': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRuHsmhWKfYk-qK_sHx3Swau-7DghKksXPpEE8zH3AM4w&s',
  'mechanical-keyboard-tkl': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwg9chFmgNpG3HyVUUirbMs2fVpsYfvplX4l1kWf2qfg&s=10',
  'gaming-mouse-26k-dpi': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQG0xNnrFC0hWEp6IclRW80Ljb_pK2uMfzQJL4eJbV3rw&s=10',
}

async function main() {
  if (seedProducts.length !== 50) throw new Error(`Seeder harus berisi 50 produk, tetapi berisi ${seedProducts.length}.`)
  const missingImages = seedProducts.filter(({ slug }) => !productImages[slug]).map(({ slug }) => slug)
  if (missingImages.length) throw new Error(`URL gambar belum tersedia untuk: ${missingImages.join(', ')}.`)

  const categories = new Map<string, number>()
  for (const name of ['VGA', 'Processor', 'RAM', 'Storage', 'Motherboard', 'Power', 'CPU Cooler', 'Case', 'Fan', 'Monitor', 'Keyboard', 'Mouse']) {
    const category = await prisma.category.findFirst({ where: { name } }) ?? await prisma.category.create({ data: { name } })
    categories.set(name, category.id)
  }

  for (const product of seedProducts) {
    const { category, ...productData } = product
    const imageUrl = productImages[product.slug]
    await prisma.product.upsert({ where: { slug: product.slug }, update: { ...productData, imageUrl, categoryId: categories.get(category)! }, create: { ...productData, imageUrl, categoryId: categories.get(category)! } })
  }
  const seededCount = await prisma.product.count({ where: { slug: { in: seedProducts.map(({ slug }) => slug) } } })
  if (seededCount !== seedProducts.length) throw new Error(`Tabel product berisi ${seededCount} dari ${seedProducts.length} produk contoh.`)
  console.log(`Tabel product berisi ${seededCount} produk contoh dengan gambar eksternal.`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
