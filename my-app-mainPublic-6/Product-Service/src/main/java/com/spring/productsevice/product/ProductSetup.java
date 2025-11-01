package com.spring.productsevice.product;

import com.spring.productsevice.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Component
public class ProductSetup {

    private static final Logger logger = LoggerFactory.getLogger(ProductSetup.class);

    private final ProductRepository productRepository;

    // Allow disabling initial data setup via application.properties
    @Value("${app.setup.initial-data.enabled:true}")
    private boolean setupEnabled;

    @Autowired
    public ProductSetup(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void setupInitialProducts() {
        if (!setupEnabled) {
            logger.info("Initial product setup is disabled. Skipping...");
            return;
        }

        logger.info("Starting initial setup for Products...");
        long startTime = System.currentTimeMillis();

        List<ProductData> productsToCreate = getInitialProducts();
        int created = 0;
        int skipped = 0;

        for (ProductData data : productsToCreate) {
            if (createProductIfNotFound(data)) {
                created++;
            } else {
                skipped++;
            }
        }

        long duration = System.currentTimeMillis() - startTime;
        logger.info("Initial setup finished. Created: {}, Skipped: {}, Duration: {}ms",
                created, skipped, duration);
    }

    private List<ProductData> getInitialProducts() {
        List<ProductData> products = new ArrayList<>();

        // Electronics
        products.add(new ProductData(
                "Laptop Pro X15", "LPX15-2024", 15, 1200.00, 950.50,
                "laptop_pro_x15.jpg", "Electronics", 3
        ));

        products.add(new ProductData(
                "Gaming Monitor 27\"", "GM27-2024", 30, 450.00, 320.00,
                "monitor_27.jpg", "Electronics", 5
        ));

        products.add(new ProductData(
                "USB-C Dock Station", "USBC-DOCK-2024", 50, 120.00, 85.00,
                "usbc_dock.jpg", "Electronics", 10
        ));

        products.add(new ProductData(
                "Webcam HD Pro", "WCHD-2024", 40, 89.99, 55.00,
                "webcam_hd.jpg", "Electronics", 8
        ));

        products.add(new ProductData(
                "Noise Cancelling Headphones", "NCH-2024", 60, 199.99, 140.00,
                "headphones_nc.jpg", "Electronics", 10
        ));

        // Accessories
        products.add(new ProductData(
                "Wireless Mouse M5", "WMM5-2024", 150, 25.99, 15.00,
                "mouse_m5.jpg", "Accessories", 20
        ));

        products.add(new ProductData(
                "Mechanical Keyboard K7", "MKK7-2024", 75, 89.50, 60.00,
                "keyboard_k7.jpg", "Accessories", 15
        ));

        products.add(new ProductData(
                "Laptop Bag Premium", "LBP-2024", 100, 45.00, 28.00,
                "laptop_bag.jpg", "Accessories", 20
        ));

        products.add(new ProductData(
                "Phone Stand Adjustable", "PSA-2024", 200, 15.99, 8.50,
                "phone_stand.jpg", "Accessories", 30
        ));

        products.add(new ProductData(
                "Cable Organizer Set", "COS-2024", 300, 12.99, 6.00,
                "cable_organizer.jpg", "Accessories", 50
        ));

        // Office Supplies
        products.add(new ProductData(
                "Ergonomic Office Chair", "EOC-2024", 20, 350.00, 240.00,
                "office_chair.jpg", "Office Supplies", 3
        ));

        products.add(new ProductData(
                "Desk Lamp LED", "DLL-2024", 80, 35.00, 22.00,
                "desk_lamp.jpg", "Office Supplies", 15
        ));

        products.add(new ProductData(
                "Notebook A5 Premium", "NB-A5-2024", 500, 8.99, 4.50,
                "notebook_a5.jpg", "Office Supplies", 80
        ));

        products.add(new ProductData(
                "Pen Set Professional", "PSP-2024", 250, 18.99, 10.00,
                "pen_set.jpg", "Office Supplies", 40
        ));

        products.add(new ProductData(
                "Whiteboard Markers Pack", "WBM-2024", 400, 9.99, 5.50,
                "whiteboard_markers.jpg", "Office Supplies", 60
        ));

        // Storage
        products.add(new ProductData(
                "External SSD 1TB", "SSD1TB-2024", 45, 120.00, 85.00,
                "ssd_1tb.jpg", "Storage", 8
        ));

        products.add(new ProductData(
                "USB Flash Drive 128GB", "USB128-2024", 200, 25.00, 15.00,
                "usb_128gb.jpg", "Storage", 30
        ));

        products.add(new ProductData(
                "Memory Card 256GB", "MC256-2024", 150, 45.00, 30.00,
                "memory_card_256.jpg", "Storage", 25
        ));

        products.add(new ProductData(
                "Portable HDD 2TB", "HDD2TB-2024", 35, 85.00, 60.00,
                "hdd_2tb.jpg", "Storage", 7
        ));

        products.add(new ProductData(
                "NAS Drive 4Bay", "NAS4B-2024", 12, 450.00, 320.00,
                "nas_4bay.jpg", "Storage", 2
        ));

        // Networking
        products.add(new ProductData(
                "WiFi Router AC1900", "WFR-AC1900-2024", 40, 89.99, 60.00,
                "router_ac1900.jpg", "Networking", 8
        ));

        products.add(new ProductData(
                "Ethernet Cable 10m", "EC10M-2024", 300, 12.99, 7.00,
                "ethernet_cable.jpg", "Networking", 50
        ));

        products.add(new ProductData(
                "Network Switch 8 Port", "NS8P-2024", 55, 45.00, 30.00,
                "network_switch.jpg", "Networking", 10
        ));

        products.add(new ProductData(
                "WiFi Extender", "WFE-2024", 70, 35.00, 22.00,
                "wifi_extender.jpg", "Networking", 12
        ));

        products.add(new ProductData(
                "Powerline Adapter Kit", "PAK-2024", 50, 55.00, 38.00,
                "powerline_adapter.jpg", "Networking", 10
        ));

        // Smart Home
        products.add(new ProductData(
                "Smart Bulb RGB", "SBR-2024", 180, 18.99, 11.00,
                "smart_bulb.jpg", "Smart Home", 30
        ));

        products.add(new ProductData(
                "Smart Plug Mini", "SPM-2024", 250, 12.99, 7.50,
                "smart_plug.jpg", "Smart Home", 40
        ));

        products.add(new ProductData(
                "Smart Speaker", "SS-2024", 90, 79.99, 55.00,
                "smart_speaker.jpg", "Smart Home", 15
        ));

        products.add(new ProductData(
                "Smart Camera Indoor", "SCI-2024", 65, 45.00, 30.00,
                "smart_camera.jpg", "Smart Home", 12
        ));

        products.add(new ProductData(
                "Smart Thermostat", "ST-2024", 30, 120.00, 85.00,
                "smart_thermostat.jpg", "Smart Home", 5
        ));

        // Gaming
        products.add(new ProductData(
                "Gaming Keyboard RGB", "GKR-2024", 55, 110.00, 75.00,
                "gaming_keyboard.jpg", "Gaming", 10
        ));

        products.add(new ProductData(
                "Gaming Mouse Pro", "GMP-2024", 80, 65.00, 42.00,
                "gaming_mouse.jpg", "Gaming", 15
        ));

        products.add(new ProductData(
                "Gaming Headset 7.1", "GH71-2024", 70, 95.00, 65.00,
                "gaming_headset.jpg", "Gaming", 12
        ));

        products.add(new ProductData(
                "Gaming Chair Pro", "GCP-2024", 18, 280.00, 190.00,
                "gaming_chair.jpg", "Gaming", 3
        ));

        products.add(new ProductData(
                "Controller Wireless", "CW-2024", 100, 55.00, 38.00,
                "controller.jpg", "Gaming", 18
        ));

        // Mobile Accessories
        products.add(new ProductData(
                "Phone Case Premium", "PCP-2024", 400, 19.99, 10.00,
                "phone_case.jpg", "Mobile Accessories", 60
        ));

        products.add(new ProductData(
                "Wireless Charger 15W", "WC15W-2024", 120, 29.99, 18.00,
                "wireless_charger.jpg", "Mobile Accessories", 20
        ));

        products.add(new ProductData(
                "Power Bank 20000mAh", "PB20K-2024", 90, 45.00, 28.00,
                "power_bank.jpg", "Mobile Accessories", 15
        ));

        products.add(new ProductData(
                "Screen Protector Tempered", "SPT-2024", 500, 8.99, 4.00,
                "screen_protector.jpg", "Mobile Accessories", 80
        ));

        products.add(new ProductData(
                "Car Phone Mount", "CPM-2024", 150, 15.99, 9.00,
                "car_mount.jpg", "Mobile Accessories", 25
        ));

        // Audio
        products.add(new ProductData(
                "Bluetooth Speaker Portable", "BSP-2024", 110, 55.00, 35.00,
                "bluetooth_speaker.jpg", "Audio", 18
        ));

        products.add(new ProductData(
                "Earbuds Wireless Pro", "EWP-2024", 140, 89.99, 60.00,
                "earbuds_pro.jpg", "Audio", 22
        ));

        products.add(new ProductData(
                "Studio Microphone USB", "SMU-2024", 35, 120.00, 80.00,
                "studio_mic.jpg", "Audio", 7
        ));

        products.add(new ProductData(
                "Audio Interface 2x2", "AI22-2024", 25, 150.00, 105.00,
                "audio_interface.jpg", "Audio", 5
        ));

        products.add(new ProductData(
                "Soundbar Home Theater", "SHT-2024", 40, 180.00, 125.00,
                "soundbar.jpg", "Audio", 8
        ));

        // Cables & Adapters
        products.add(new ProductData(
                "USB-C to HDMI Cable", "USBCHDMI-2024", 200, 18.99, 10.00,
                "usbc_hdmi.jpg", "Cables & Adapters", 35
        ));

        products.add(new ProductData(
                "Lightning Cable 2m", "LC2M-2024", 300, 12.99, 6.50,
                "lightning_cable.jpg", "Cables & Adapters", 50
        ));

        products.add(new ProductData(
                "HDMI Cable 4K 3m", "HDMI4K3M-2024", 250, 15.99, 8.00,
                "hdmi_cable.jpg", "Cables & Adapters", 40
        ));

        products.add(new ProductData(
                "Multi-Port USB Hub", "MPUH-2024", 120, 25.00, 15.00,
                "usb_hub.jpg", "Cables & Adapters", 20
        ));

        products.add(new ProductData(
                "Display Port Cable", "DPC-2024", 150, 19.99, 12.00,
                "displayport_cable.jpg", "Cables & Adapters", 25
        ));
        products.add(new ProductData("Smart Watch Pro Series 8", "SWP8-2024", 85, 299.99, 220.00, "smartwatch_pro8.jpg", "Wearables", 15));
        products.add(new ProductData("Tablet Android 12 Inch", "TAB12-2024", 40, 380.00, 280.00, "tablet_12inch.jpg", "Electronics", 7));
        products.add(new ProductData("Drone Camera 4K", "DC4K-2024", 22, 650.00, 480.00, "drone_4k.jpg", "Electronics", 4));
        products.add(new ProductData("Action Camera Waterproof", "ACW-2024", 60, 180.00, 130.00, "action_camera.jpg", "Electronics", 10));
        products.add(new ProductData("E-Reader 7 Inch", "ER7-2024", 95, 140.00, 95.00, "ereader_7.jpg", "Electronics", 18));
        products.add(new ProductData("Fitness Tracker Band", "FTB-2024", 200, 45.00, 28.00, "fitness_tracker.jpg", "Wearables", 35));
        products.add(new ProductData("VR Headset Gaming", "VRHG-2024", 28, 420.00, 310.00, "vr_headset.jpg", "Gaming", 5));
        products.add(new ProductData("Portable Projector HD", "PPH-2024", 35, 280.00, 195.00, "projector_portable.jpg", "Electronics", 6));
        products.add(new ProductData("Digital Drawing Tablet", "DDT-2024", 45, 220.00, 155.00, "drawing_tablet.jpg", "Accessories", 8));
        products.add(new ProductData("Webcam 4K Ultra HD", "WC4K-2024", 70, 135.00, 95.00, "webcam_4k.jpg", "Electronics", 12));
        products.add(new ProductData("Mechanical Numpad RGB", "MNR-2024", 120, 35.00, 22.00, "numpad_rgb.jpg", "Accessories", 20));
        products.add(new ProductData("USB Microphone Condenser", "USMC-2024", 50, 85.00, 58.00, "usb_mic.jpg", "Audio", 10));
        products.add(new ProductData("Ring Light 18 Inch", "RL18-2024", 65, 75.00, 48.00, "ring_light.jpg", "Photography", 12));
        products.add(new ProductData("Tripod Professional Carbon", "TPC-2024", 38, 165.00, 115.00, "tripod_carbon.jpg", "Photography", 7));
        products.add(new ProductData("SD Card Reader USB-C", "SDCR-2024", 180, 22.00, 13.00, "sd_reader.jpg", "Accessories", 30));
        products.add(new ProductData("Laptop Cooling Pad RGB", "LCPR-2024", 90, 38.00, 24.00, "cooling_pad.jpg", "Accessories", 16));
        products.add(new ProductData("Surge Protector 12 Outlet", "SP12-2024", 110, 42.00, 28.00, "surge_protector.jpg", "Electronics", 20));
        products.add(new ProductData("Smart Door Lock", "SDL-2024", 32, 185.00, 130.00, "smart_lock.jpg", "Smart Home", 6));
        products.add(new ProductData("Video Doorbell HD", "VDB-2024", 48, 155.00, 110.00, "video_doorbell.jpg", "Smart Home", 9));
        products.add(new ProductData("Motion Sensor Smart", "MSS-2024", 140, 28.00, 16.00, "motion_sensor.jpg", "Smart Home", 25));
        products.add(new ProductData("LED Strip Lights 5M", "LEDSL5-2024", 220, 32.00, 19.00, "led_strip.jpg", "Smart Home", 40));
        products.add(new ProductData("Smart Smoke Detector", "SSD-2024", 75, 48.00, 32.00, "smoke_detector.jpg", "Smart Home", 14));
        products.add(new ProductData("Air Purifier Compact", "APC-2024", 42, 125.00, 88.00, "air_purifier.jpg", "Home Appliances", 8));
        products.add(new ProductData("Desk Organizer Bamboo", "DOB-2024", 160, 28.00, 16.00, "desk_organizer.jpg", "Office Supplies", 28));
        products.add(new ProductData("Monitor Arm Dual Mount", "MADM-2024", 55, 95.00, 65.00, "monitor_arm.jpg", "Accessories", 10));
        products.add(new ProductData("Keyboard Wrist Rest Memory", "KWRM-2024", 135, 24.00, 14.00, "wrist_rest.jpg", "Accessories", 24));
        products.add(new ProductData("Mouse Pad Extended XXL", "MPEX-2024", 200, 18.00, 10.00, "mousepad_xxl.jpg", "Accessories", 35));
        products.add(new ProductData("Cable Management Box", "CMB-2024", 175, 22.00, 13.00, "cable_box.jpg", "Accessories", 30));
        products.add(new ProductData("Printer Wireless All-in-One", "PWAO-2024", 28, 185.00, 135.00, "printer_wireless.jpg", "Electronics", 5));
        products.add(new ProductData("Scanner Portable Document", "SPD-2024", 35, 145.00, 98.00, "scanner_portable.jpg", "Electronics", 7));
        products.add(new ProductData("Label Maker Bluetooth", "LMB-2024", 60, 55.00, 36.00, "label_maker.jpg", "Office Supplies", 11));
        products.add(new ProductData("Laminator Machine A4", "LMA4-2024", 45, 68.00, 45.00, "laminator.jpg", "Office Supplies", 9));
        products.add(new ProductData("Paper Shredder Cross Cut", "PSCC-2024", 32, 95.00, 65.00, "shredder.jpg", "Office Supplies", 6));
        products.add(new ProductData("Stapler Heavy Duty", "SHD-2024", 85, 32.00, 20.00, "stapler_heavy.jpg", "Office Supplies", 15));
        products.add(new ProductData("Bluetooth Adapter USB", "BAU-2024", 240, 15.00, 8.00, "bluetooth_adapter.jpg", "Accessories", 42));
        products.add(new ProductData("WiFi Adapter Dual Band", "WADB-2024", 180, 28.00, 17.00, "wifi_adapter.jpg", "Networking", 32));
        products.add(new ProductData("Graphics Card RTX 3060", "GC3060-2024", 15, 450.00, 320.00, "gpu_rtx3060.jpg", "Computer Parts", 3));
        products.add(new ProductData("RAM DDR5 32GB Kit", "RAM32-2024", 35, 165.00, 120.00, "ram_32gb.jpg", "Computer Parts", 7));
        products.add(new ProductData("CPU Cooler RGB Tower", "CCRT-2024", 48, 78.00, 52.00, "cpu_cooler.jpg", "Computer Parts", 9));
        products.add(new ProductData("PC Case Mid Tower RGB", "PCMT-2024", 25, 95.00, 68.00, "pc_case.jpg", "Computer Parts", 5));
        products.add(new ProductData("PSU Modular 750W Gold", "PSU750-2024", 38, 125.00, 88.00, "psu_750w.jpg", "Computer Parts", 7));
        products.add(new ProductData("Motherboard B550 ATX", "MBB550-2024", 22, 185.00, 135.00, "mobo_b550.jpg", "Computer Parts", 4));
        products.add(new ProductData("Thermal Paste Premium", "TPP-2024", 280, 12.00, 6.50, "thermal_paste.jpg", "Computer Parts", 50));
        products.add(new ProductData("Anti-Static Wrist Strap", "ASWS-2024", 220, 8.00, 4.50, "wrist_strap.jpg", "Tools", 40));
        products.add(new ProductData("Screwdriver Set Precision", "SSP-2024", 140, 28.00, 16.00, "screwdriver_set.jpg", "Tools", 25));
        products.add(new ProductData("Cable Tester Network", "CTN-2024", 65, 38.00, 24.00, "cable_tester.jpg", "Tools", 12));
        products.add(new ProductData("Digital Multimeter", "DM-2024", 55, 48.00, 32.00, "multimeter.jpg", "Tools", 10));
        products.add(new ProductData("Soldering Iron Kit", "SIK-2024", 42, 55.00, 36.00, "soldering_kit.jpg", "Tools", 8));
        products.add(new ProductData("Hot Glue Gun Electric", "HGGE-2024", 95, 22.00, 13.00, "glue_gun.jpg", "Tools", 17));
        products.add(new ProductData("Tool Box Portable Organizer", "TBPO-2024", 70, 45.00, 28.00, "tool_box.jpg", "Tools", 13));

        return products;
    }

    private boolean createProductIfNotFound(ProductData data) {
        Product existingProduct = productRepository.findByBarcode(data.barcode);

        if (existingProduct != null) {
            logger.debug("Product with barcode '{}' already exists. Skipping.", data.barcode);
            return false;
        }

        logger.info("Creating new product: {}", data.name);
        Product newProduct = new Product();
        newProduct.setName(data.name);
        newProduct.setBarcode(data.barcode);
        newProduct.setQuantity(data.quantity);
        newProduct.setPrice(data.price);
        newProduct.setPriceInit(data.priceInit);
        newProduct.setImage(data.image);
        newProduct.setCategory(data.category);
        newProduct.setQuantityAlmostDepleted(data.quantityAlmostDepleted);
        newProduct.setDateCreating(new Date());
        newProduct.setDateLastModification(new Date());

        productRepository.save(newProduct);
        return true;
    }

    // Inner class to hold product data
    private static class ProductData {
        String name;
        String barcode;
        int quantity;
        double price;
        double priceInit;
        String image;
        String category;
        int quantityAlmostDepleted;

        ProductData(String name, String barcode, int quantity, double price,
                    double priceInit, String image, String category, int quantityAlmostDepleted) {
            this.name = name;
            this.barcode = barcode;
            this.quantity = quantity;
            this.price = price;
            this.priceInit = priceInit;
            this.image = image;
            this.category = category;
            this.quantityAlmostDepleted = quantityAlmostDepleted;
        }
    }
}