package com.spring.supplierclientservice;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Component
public class SupplierClientSetup {

    private static final Logger logger = LoggerFactory.getLogger(SupplierClientSetup.class);

    private final SupplierClientRepository supplierClientRepository;

    @Value("${app.setup.initial-data.enabled:true}")
    private boolean setupEnabled;

    @Autowired
    public SupplierClientSetup(SupplierClientRepository supplierClientRepository) {
        this.supplierClientRepository = supplierClientRepository;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void setupInitialSupplierClients() {
        if (!setupEnabled) {
            logger.info("Initial supplier/client setup is disabled. Skipping...");
            return;
        }

        logger.info("Starting initial setup for Suppliers and Clients...");
        long startTime = System.currentTimeMillis();

        List<SupplierClientData> dataList = getInitialSupplierClients();
        int created = 0;
        int skipped = 0;

        for (SupplierClientData data : dataList) {
            if (createSupplierClientIfNotFound(data)) {
                created++;
            } else {
                skipped++;
            }
        }

        long duration = System.currentTimeMillis() - startTime;
        logger.info("Initial setup finished. Created: {}, Skipped: {}, Duration: {}ms",
                created, skipped, duration);
    }

    private List<SupplierClientData> getInitialSupplierClients() {
        List<SupplierClientData> list = new ArrayList<>();

        // Suppliers
        list.add(new SupplierClientData("TechVision Electronics", "contact@techvision.com", "0522334455", "Electronics Supplier", "Supplier", "Casablanca"));
        list.add(new SupplierClientData("GlobalTech Distributors", "info@globaltech.ma", "0537445566", "IT Equipment Supplier", "Supplier", "Rabat"));
        list.add(new SupplierClientData("Digital Solutions Co", "sales@digitalsol.com", "0523556677", "Software and Hardware Supplier", "Supplier", "Marrakech"));
        list.add(new SupplierClientData("Prime Electronics Supply", "orders@primeelectronics.ma", "0528667788", "Consumer Electronics Supplier", "Supplier", "Agadir"));
        list.add(new SupplierClientData("Metro Office Supplies", "contact@metrooffice.com", "0539778899", "Office Equipment Supplier", "Supplier", "Tangier"));
        list.add(new SupplierClientData("Atlas Computer Parts", "info@atlascomputer.ma", "0524889900", "Computer Components Supplier", "Supplier", "Fes"));
        list.add(new SupplierClientData("Sahara Tech Imports", "sales@saharatech.com", "0528991122", "Technology Importer", "Supplier", "Agadir"));
        list.add(new SupplierClientData("Mediterranean Hardware", "contact@medhardware.ma", "0539112233", "Hardware and Tools Supplier", "Supplier", "Tetouan"));
        list.add(new SupplierClientData("Royal Gadgets Supply", "orders@royalgadgets.com", "0522223344", "Smart Devices Supplier", "Supplier", "Casablanca"));
        list.add(new SupplierClientData("Innovation Tech Partners", "info@innovationtech.ma", "0537334455", "Technology Solutions Provider", "Supplier", "Rabat"));
        list.add(new SupplierClientData("Express Electronics Hub", "sales@expresselectronics.com", "0523445566", "Fast Electronics Supplier", "Supplier", "Marrakech"));
        list.add(new SupplierClientData("Elite Computer Systems", "contact@elitecomputer.ma", "0524556677", "Enterprise IT Supplier", "Supplier", "Fes"));
        list.add(new SupplierClientData("Smart Home Solutions", "info@smarthomesol.com", "0528667788", "IoT Devices Supplier", "Supplier", "Agadir"));
        list.add(new SupplierClientData("Network Pro Distributors", "sales@networkpro.ma", "0539778899", "Networking Equipment Supplier", "Supplier", "Tangier"));
        list.add(new SupplierClientData("Digital Print Supplies", "orders@digitalprint.com", "0522889900", "Printing Equipment Supplier", "Supplier", "Casablanca"));
        list.add(new SupplierClientData("Wireless World Morocco", "contact@wirelessworld.ma", "0537991122", "Mobile and Wireless Supplier", "Supplier", "Rabat"));
        list.add(new SupplierClientData("Security Systems Pro", "info@securitypro.com", "0523112233", "Security Equipment Supplier", "Supplier", "Marrakech"));
        list.add(new SupplierClientData("Gaming Gear Distributors", "sales@gaminggear.ma", "0524223344", "Gaming Products Supplier", "Supplier", "Fes"));
        list.add(new SupplierClientData("Audio Visual Solutions", "contact@avsolutions.com", "0528334455", "AV Equipment Supplier", "Supplier", "Agadir"));
        list.add(new SupplierClientData("Professional Tools Supply", "orders@protools.ma", "0539445566", "Professional Equipment Supplier", "Supplier", "Tangier"));
        list.add(new SupplierClientData("Green Energy Tech", "info@greenenergy.com", "0522556677", "Sustainable Tech Supplier", "Supplier", "Casablanca"));
        list.add(new SupplierClientData("Mobile Accessories Plus", "sales@mobileplus.ma", "0537667788", "Mobile Accessories Supplier", "Supplier", "Rabat"));
        list.add(new SupplierClientData("Data Storage Solutions", "contact@datastorage.com", "0523778899", "Storage Devices Supplier", "Supplier", "Marrakech"));
        list.add(new SupplierClientData("Cable and Connector Co", "info@cableconnector.ma", "0524889900", "Cables and Adapters Supplier", "Supplier", "Fes"));
        list.add(new SupplierClientData("Smart Office Technology", "orders@smartoffice.com", "0528991122", "Office Tech Supplier", "Supplier", "Agadir"));
        list.add(new SupplierClientData("Precision Tools Morocco", "sales@precisiontools.ma", "0539112233", "Technical Tools Supplier", "Supplier", "Tetouan"));
        list.add(new SupplierClientData("Future Tech Innovations", "contact@futuretech.com", "0522223344", "Advanced Technology Supplier", "Supplier", "Casablanca"));
        list.add(new SupplierClientData("Quality Components Ltd", "info@qualitycomp.ma", "0537334455", "Electronic Components Supplier", "Supplier", "Rabat"));
        list.add(new SupplierClientData("Budget Electronics Store", "sales@budgetelectronics.com", "0523445566", "Affordable Electronics Supplier", "Supplier", "Marrakech"));
        list.add(new SupplierClientData("Premium Tech Supplies", "orders@premiumtech.ma", "0524556677", "High-End Tech Supplier", "Supplier", "Fes"));
        list.add(new SupplierClientData("Industrial Equipment Co", "contact@industrialeq.com", "0528667788", "Industrial Tech Supplier", "Supplier", "Agadir"));
        list.add(new SupplierClientData("Wireless Solutions Group", "info@wirelessgroup.ma", "0539778899", "Wireless Technology Supplier", "Supplier", "Tangier"));
        list.add(new SupplierClientData("Computer Repair Supplies", "sales@repairsupplies.com", "0522889900", "Repair Parts Supplier", "Supplier", "Casablanca"));
        list.add(new SupplierClientData("LED Lighting Systems", "contact@ledsystems.ma", "0537991122", "LED Products Supplier", "Supplier", "Rabat"));
        list.add(new SupplierClientData("Power Solutions Morocco", "info@powersolutions.com", "0523112233", "Power Equipment Supplier", "Supplier", "Marrakech"));
        list.add(new SupplierClientData("Tech Accessories Hub", "orders@techhub.ma", "0524223344", "Tech Accessories Supplier", "Supplier", "Fes"));
        list.add(new SupplierClientData("Digital Media Supplies", "sales@digitalmedia.com", "0528334455", "Media Equipment Supplier", "Supplier", "Agadir"));
        list.add(new SupplierClientData("Automation Tech Systems", "contact@automationtech.ma", "0539445566", "Automation Equipment Supplier", "Supplier", "Tangier"));
        list.add(new SupplierClientData("Cloud Computing Supplies", "info@cloudsupplies.com", "0522556677", "Cloud Infrastructure Supplier", "Supplier", "Casablanca"));
        list.add(new SupplierClientData("Robotics Components Co", "sales@roboticscomp.ma", "0537667788", "Robotics Parts Supplier", "Supplier", "Rabat"));
        list.add(new SupplierClientData("Virtual Reality Systems", "orders@vrsystems.com", "0523778899", "VR Equipment Supplier", "Supplier", "Marrakech"));
        list.add(new SupplierClientData("3D Printing Supplies", "contact@3dprinting.ma", "0524889900", "3D Printer Supplier", "Supplier", "Fes"));
        list.add(new SupplierClientData("Drone Technology Co", "info@dronetech.com", "0528991122", "Drone and Accessories Supplier", "Supplier", "Agadir"));
        list.add(new SupplierClientData("AI Solutions Provider", "sales@aisolutions.ma", "0539112233", "AI Hardware Supplier", "Supplier", "Tetouan"));
        list.add(new SupplierClientData("Blockchain Tech Supplies", "contact@blockchaintech.com", "0522223344", "Blockchain Equipment Supplier", "Supplier", "Casablanca"));
        list.add(new SupplierClientData("Quantum Computing Parts", "info@quantumparts.ma", "0537334455", "Advanced Computing Supplier", "Supplier", "Rabat"));
        list.add(new SupplierClientData("Fiber Optics Morocco", "orders@fiberoptics.com", "0523445566", "Fiber Optic Supplier", "Supplier", "Marrakech"));
        list.add(new SupplierClientData("Renewable Energy Tech", "sales@renewabletech.ma", "0524556677", "Green Technology Supplier", "Supplier", "Fes"));
        list.add(new SupplierClientData("Medical Tech Supplies", "contact@medicaltech.com", "0528667788", "Medical Equipment Supplier", "Supplier", "Agadir"));
        list.add(new SupplierClientData("Educational Tech Co", "info@edutech.ma", "0539778899", "Educational Technology Supplier", "Supplier", "Tangier"));

        // Clients
        list.add(new SupplierClientData("Maroc Telecom", "purchasing@maroctelecom.ma", "0522112233", "Major telecom client", "Client", "Casablanca"));
        list.add(new SupplierClientData("BMCE Bank", "procurement@bmcebank.ma", "0537223344", "Banking sector client", "Client", "Rabat"));
        list.add(new SupplierClientData("OCP Group", "supplies@ocpgroup.ma", "0523334455", "Mining and chemicals client", "Client", "Marrakech"));
        list.add(new SupplierClientData("ONCF Railways", "orders@oncf.ma", "0524445566", "Transportation client", "Client", "Fes"));
        list.add(new SupplierClientData("Royal Air Maroc", "procurement@royalairmaroc.com", "0522556677", "Aviation client", "Client", "Casablanca"));
        list.add(new SupplierClientData("Managem Mining", "purchasing@managem.ma", "0537667788", "Mining operations client", "Client", "Rabat"));
        list.add(new SupplierClientData("Attijariwafa Bank", "supplies@attijariwafa.com", "0523778899", "Financial services client", "Client", "Marrakech"));
        list.add(new SupplierClientData("Lydec Utilities", "orders@lydec.ma", "0522889900", "Utilities provider client", "Client", "Casablanca"));
        list.add(new SupplierClientData("Label Vie Retail", "procurement@labelvie.ma", "0528991122", "Retail chain client", "Client", "Agadir"));
        list.add(new SupplierClientData("Marjane Holding", "purchasing@marjane.ma", "0537112233", "Supermarket chain client", "Client", "Rabat"));
        list.add(new SupplierClientData("Inwi Telecom", "supplies@inwi.ma", "0523223344", "Telecommunications client", "Client", "Marrakech"));
        list.add(new SupplierClientData("SAHAM Group", "orders@sahamgroup.ma", "0524334455", "Insurance client", "Client", "Fes"));
        list.add(new SupplierClientData("CDG Development", "procurement@cdg.ma", "0522445566", "Development bank client", "Client", "Casablanca"));
        list.add(new SupplierClientData("Afriquia Gas", "purchasing@afriquia.com", "0537556677", "Energy sector client", "Client", "Rabat"));
        list.add(new SupplierClientData("Delta Holding", "supplies@deltaholding.ma", "0523667788", "Conglomerate client", "Client", "Marrakech"));
        list.add(new SupplierClientData("Auto Hall Motors", "orders@autohall.ma", "0524778899", "Automotive client", "Client", "Fes"));
        list.add(new SupplierClientData("Cosumar Sugar", "procurement@cosumar.ma", "0528889900", "Food industry client", "Client", "Agadir"));
        list.add(new SupplierClientData("LafargeHolcim Morocco", "purchasing@lafargeholcim.ma", "0539991122", "Construction materials client", "Client", "Tangier"));
        list.add(new SupplierClientData("Lesieur Cristal", "supplies@lesieur.ma", "0522112244", "Food products client", "Client", "Casablanca"));
        list.add(new SupplierClientData("Centrale Danone", "orders@centraledanone.com", "0537223355", "Dairy products client", "Client", "Rabat"));
        list.add(new SupplierClientData("Akdital Healthcare", "procurement@akdital.ma", "0523334466", "Healthcare provider client", "Client", "Marrakech"));
        list.add(new SupplierClientData("NAREVA Energy", "purchasing@nareva.ma", "0524445577", "Renewable energy client", "Client", "Fes"));
        list.add(new SupplierClientData("Jet Contractors", "supplies@jetcontractors.ma", "0528556688", "Construction client", "Client", "Agadir"));
        list.add(new SupplierClientData("TGCC Construction", "orders@tgcc.ma", "0539667799", "Infrastructure client", "Client", "Tangier"));
        list.add(new SupplierClientData("Sofac Credit", "procurement@sofac.ma", "0522778800", "Consumer credit client", "Client", "Casablanca"));
        list.add(new SupplierClientData("Wafa Assurance", "purchasing@wafaassurance.ma", "0537889911", "Insurance provider client", "Client", "Rabat"));
        list.add(new SupplierClientData("Holmarcom Group", "supplies@holmarcom.ma", "0523991022", "Diversified holding client", "Client", "Marrakech"));
        list.add(new SupplierClientData("Asment Temara", "orders@asmenttemara.ma", "0524112133", "Cement manufacturer client", "Client", "Fes"));
        list.add(new SupplierClientData("Sonasid Steel", "procurement@sonasid.ma", "0528223244", "Steel industry client", "Client", "Agadir"));
        list.add(new SupplierClientData("CTM Transport", "purchasing@ctm.ma", "0539334355", "Transportation services client", "Client", "Tangier"));
        list.add(new SupplierClientData("Supratours Travel", "supplies@supratours.ma", "0522445466", "Travel and tourism client", "Client", "Casablanca"));
        list.add(new SupplierClientData("Morocco Mall", "orders@moroccomall.ma", "0537556577", "Shopping center client", "Client", "Rabat"));
        list.add(new SupplierClientData("Anfa Place Mall", "procurement@anfaplace.ma", "0523667688", "Retail complex client", "Client", "Marrakech"));
        list.add(new SupplierClientData("Technopark Casablanca", "purchasing@technopark.ma", "0522778799", "Technology hub client", "Client", "Casablanca"));
        list.add(new SupplierClientData("CIH Bank", "supplies@cihbank.ma", "0537889810", "Banking institution client", "Client", "Rabat"));
        list.add(new SupplierClientData("BMCI Group", "orders@bmci.ma", "0523991021", "Financial services client", "Client", "Marrakech"));
        list.add(new SupplierClientData("Societe Generale Maroc", "procurement@sgmaroc.com", "0524112132", "International bank client", "Client", "Fes"));
        list.add(new SupplierClientData("Credit du Maroc", "purchasing@cdm.ma", "0528223243", "Credit institution client", "Client", "Agadir"));
        list.add(new SupplierClientData("Bank Al-Maghrib", "supplies@bkam.ma", "0537334354", "Central bank client", "Client", "Rabat"));
        list.add(new SupplierClientData("Morocco Export", "orders@moroccoexport.ma", "0522445465", "Export promotion client", "Client", "Casablanca"));
        list.add(new SupplierClientData("ONDA Airports", "procurement@onda.ma", "0523556576", "Airport authority client", "Client", "Marrakech"));
        list.add(new SupplierClientData("Tanger Med Port", "purchasing@tangermed.ma", "0539667687", "Port operations client", "Client", "Tangier"));
        list.add(new SupplierClientData("ONEE Water Electric", "supplies@onee.ma", "0524778798", "Water and electricity client", "Client", "Fes"));
        list.add(new SupplierClientData("ADM Highways", "orders@adm.ma", "0528889809", "Highway management client", "Client", "Agadir"));
        list.add(new SupplierClientData("ITHMAR Real Estate", "procurement@ithmar.ma", "0522991920", "Real estate development client", "Client", "Casablanca"));
        list.add(new SupplierClientData("Addoha Group", "purchasing@addoha.ma", "0537112031", "Property developer client", "Client", "Rabat"));
        list.add(new SupplierClientData("Palmeraie Development", "supplies@palmeraie.ma", "0523223142", "Resort developer client", "Client", "Marrakech"));
        list.add(new SupplierClientData("SOMED Hotels", "orders@somed.ma", "0524334253", "Hospitality chain client", "Client", "Fes"));
        list.add(new SupplierClientData("Risma Hotel Group", "procurement@risma.ma", "0528445364", "Hotel operator client", "Client", "Agadir"));
        list.add(new SupplierClientData("Atlas Pharmaceuticals", "orders@atlaspharma.ma", "0522556475", "Medical supplies distributor", "Supplier", "Casablanca"));
        list.add(new SupplierClientData("Moroccan Textile Mills", "sales@textilema.com", "0537667586", "Fabric and textile supplier", "Supplier", "Rabat"));
        list.add(new SupplierClientData("Agro-Tech Solutions", "contact@agrotech.ma", "0523778697", "Agricultural equipment supplier", "Supplier", "Marrakech"));
        list.add(new SupplierClientData("Marine Equipment Co", "info@marineequip.com", "0528889708", "Maritime supplies provider", "Supplier", "Agadir"));
        list.add(new SupplierClientData("Solar Energy Systems", "orders@solarenergy.ma", "0539991819", "Solar panels supplier", "Supplier", "Tangier"));
        list.add(new SupplierClientData("Packaging Industries", "sales@packagingind.com", "0524112920", "Packaging materials supplier", "Supplier", "Fes"));
        list.add(new SupplierClientData("Chemical Solutions Pro", "contact@chemicalsol.ma", "0522223031", "Industrial chemicals supplier", "Supplier", "Casablanca"));
        list.add(new SupplierClientData("Food Service Equipment", "info@foodservice.com", "0537334142", "Restaurant equipment supplier", "Supplier", "Rabat"));
        list.add(new SupplierClientData("Construction Materials Plus", "orders@constructmat.ma", "0523445253", "Building materials supplier", "Supplier", "Marrakech"));
        list.add(new SupplierClientData("Automotive Parts Direct", "sales@autopartsdirect.com", "0528556364", "Car parts distributor", "Supplier", "Agadir"));
        list.add(new SupplierClientData("Laboratory Equipment Co", "contact@labequip.ma", "0539667475", "Scientific equipment supplier", "Supplier", "Tetouan"));
        list.add(new SupplierClientData("Hospitality Supplies", "info@hospitalitysup.com", "0524778586", "Hotel supplies provider", "Supplier", "Fes"));
        list.add(new SupplierClientData("Industrial Safety Gear", "orders@safetygear.ma", "0522889697", "Safety equipment supplier", "Supplier", "Casablanca"));
        list.add(new SupplierClientData("Electrical Components Ltd", "sales@electricalcomp.com", "0537991708", "Electrical parts supplier", "Supplier", "Rabat"));
        list.add(new SupplierClientData("Furniture Wholesale Morocco", "contact@furnituremor.ma", "0523112819", "Office furniture supplier", "Supplier", "Marrakech"));
        list.add(new SupplierClientData("Cleaning Products Pro", "info@cleaningpro.com", "0524223920", "Cleaning supplies distributor", "Supplier", "Fes"));
        list.add(new SupplierClientData("HVAC Systems Morocco", "orders@hvacsystems.ma", "0528334031", "Climate control supplier", "Supplier", "Agadir"));
        list.add(new SupplierClientData("Plumbing Supplies Direct", "sales@plumbingsupply.com", "0539445142", "Plumbing equipment provider", "Supplier", "Tangier"));
        list.add(new SupplierClientData("Paint and Coating Co", "contact@paintcoating.ma", "0522556253", "Paint products supplier", "Supplier", "Casablanca"));
        list.add(new SupplierClientData("Sports Equipment Morocco", "info@sportsequip.com", "0537667364", "Sports goods supplier", "Supplier", "Rabat"));
        list.add(new SupplierClientData("Beauty Products Wholesale", "orders@beautywholesale.ma", "0523778475", "Cosmetics distributor", "Supplier", "Marrakech"));
        list.add(new SupplierClientData("Pet Supplies Morocco", "sales@petsupplies.com", "0528889586", "Pet products supplier", "Supplier", "Agadir"));
        list.add(new SupplierClientData("Garden Equipment Pro", "contact@gardenequip.ma", "0539991697", "Gardening tools supplier", "Supplier", "Tetouan"));
        list.add(new SupplierClientData("Bakery Equipment Supply", "info@bakeryequip.com", "0524112708", "Baking equipment provider", "Supplier", "Fes"));
        list.add(new SupplierClientData("Photography Gear Morocco", "orders@photogear.ma", "0522223819", "Camera equipment supplier", "Supplier", "Casablanca"));
        list.add(new SupplierClientData("Music Instruments Co", "sales@musicinstruments.com", "0537334920", "Musical equipment distributor", "Supplier", "Rabat"));
        list.add(new SupplierClientData("Jewelry Supplies Pro", "contact@jewelrysup.ma", "0523445031", "Jewelry making supplies", "Supplier", "Marrakech"));
        list.add(new SupplierClientData("Printing Press Supplies", "info@printpress.com", "0524556142", "Printing materials supplier", "Supplier", "Fes"));
        list.add(new SupplierClientData("Recycling Equipment Co", "orders@recyclingequip.ma", "0528667253", "Waste management supplier", "Supplier", "Agadir"));
        list.add(new SupplierClientData("Refrigeration Systems", "sales@refrigeration.com", "0539778364", "Cooling equipment provider", "Supplier", "Tangier"));
        list.add(new SupplierClientData("Royal Golf Marrakech", "booking@royalgolf.ma", "0523889475", "Premium golf resort client", "Client", "Marrakech"));
        list.add(new SupplierClientData("Mazagan Beach Resort", "procurement@mazaganresort.com", "0523991586", "Luxury beach resort client", "Client", "El Jadida"));
        list.add(new SupplierClientData("Sofitel Casablanca", "purchasing@sofitelcasa.ma", "0522112697", "International hotel client", "Client", "Casablanca"));
        list.add(new SupplierClientData("Four Seasons Marrakech", "supplies@fourseasons.ma", "0524223708", "Luxury hotel chain client", "Client", "Marrakech"));
        list.add(new SupplierClientData("Hyatt Regency Casablanca", "orders@hyattcasa.com", "0522334819", "Business hotel client", "Client", "Casablanca"));
        list.add(new SupplierClientData("Radisson Blu Hotels", "procurement@radissonma.ma", "0537445920", "Hotel chain client", "Client", "Rabat"));
        list.add(new SupplierClientData("Kempinski Hotels Morocco", "purchasing@kempinski.ma", "0528556031", "Premium hospitality client", "Client", "Agadir"));
        list.add(new SupplierClientData("InterContinental Tangier", "supplies@ictangier.com", "0539667142", "International hotel client", "Client", "Tangier"));
        list.add(new SupplierClientData("Movenpick Casablanca", "orders@movenpick.ma", "0522778253", "Swiss hotel chain client", "Client", "Casablanca"));
        list.add(new SupplierClientData("Hilton Garden Inn", "procurement@hiltongarden.ma", "0537889364", "Hotel franchise client", "Client", "Rabat"));
        return list;
    }

    private boolean createSupplierClientIfNotFound(SupplierClientData data) {
        SupplierClient existing = supplierClientRepository.findByName(data.name);

        if (existing != null) {
            logger.debug("Supplier/Client '{}' already exists. Skipping.", data.name);
            return false;
        }

        logger.info("Creating new supplier/client: {}", data.name);
        SupplierClient sc = new SupplierClient();
        sc.setName(data.name);
        sc.setEmail(data.email);
        sc.setPhoneNumber(data.phoneNumber);
        sc.setDescription(data.description);
        sc.setCategory(data.category);
        sc.setLocation(data.location);
        sc.setTotalSales(0.0);
        sc.setTotalePurchase(0.0);
        sc.setBorrowingPriceSales(0.0);
        sc.setBorrowingPricePurchase(0.0);
        sc.setCreatedAt(new Date());
        sc.setUpdatedAt(new Date());

        supplierClientRepository.save(sc);
        return true;
    }

    private static class SupplierClientData {
        String name;
        String email;
        String phoneNumber;
        String description;
        String category;
        String location;

        SupplierClientData(String name, String email, String phoneNumber, String description, String category, String location) {
            this.name = name;
            this.email = email;
            this.phoneNumber = phoneNumber;
            this.description = description;
            this.category = category;
            this.location = location;
        }
    }
}