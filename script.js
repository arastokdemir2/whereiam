// ... önceki kodlar ...

// 1. 3D Küreyi Başlatma ve OpenStreetMap Katmanını Ekleme
const viewer = new Cesium.Viewer('cesiumContainer', {
    // 3D küre görünümü için gerekli ayarlar:
    timeline: false, 
    animation: false, 
    baseLayerPicker: false, 
    geocoder: false, 
    
    // BURADA DEĞİŞİKLİK YAPILDI: homeButton'ı etkinleştirerek büyütme/küçültme butonlarını ekliyoruz
    homeButton: true, // Büyütme/küçültme (+ ve -) butonlarını göster
    
    sceneModePicker: false, 
    navigationHelpButton: false, 
    infoBox: false, 
    
    // YILDIZLAR VE ARKA PLAN AYARLARI
    skyBox: new Cesium.SkyBox({ 
        sources : {
            positiveX : Cesium.buildModuleUrl('Assets/Textures/SkyBox/tycho2t3_80_px.jpg'),
            negativeX : Cesium.buildModuleUrl('Assets/Textures/SkyBox/tycho2t3_80_nx.jpg'),
            positiveY : Cesium.buildModuleUrl('Assets/Textures/SkyBox/tycho2t3_80_py.jpg'),
            negativeY : Cesium.buildModuleUrl('Assets/Textures/SkyBox/tycho2t3_80_ny.jpg'),
            positiveZ : Cesium.buildModuleUrl('Assets/Textures/SkyBox/tycho2t3_80_pz.jpg'),
            negativeZ : Cesium.buildModuleUrl('Assets/Textures/SkyBox/tycho2t3_80_nz.jpg')
        }
    }),
    
    // VARSAYILAN KATMANI KAPAT
    baseLayer: false 
});

// ... geri kalan kodlar aynı kalacaktır ...

// ÜCRETSİZ OPENSTREETMAP KATMANINI EKLE
viewer.imageryLayers.addImageryProvider(
    new Cesium.OpenStreetMapImageryProvider({
        url : 'https://a.tile.openstreetmap.org/'
    })
);

// BAŞLANGIÇ GÖRÜNÜMÜNÜ DÜNYAYI ORTALAYACAK ŞEKİLDE AYARLA
viewer.camera.flyHome(0);

// Kullanıcı girişini geçici olarak kapat
viewer.scene.screenSpaceCameraController.enableInputs = false;

// 2. Kullanıcının Konumunu Alma
if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(position => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        console.log(`Konum Alındı: Enlem ${lat}, Boylam ${lon}`);

        // Konum alındıktan sonra 3D küre üzerinde animasyonlu zoom fonksiyonunu çağır.
        flyToLocation(lat, lon);
        
    }, error => {
        // Hata veya izin reddi durumunda
        console.error("Konum alınamadı:", error);
        alert("Konum bilginize erişim izni vermediniz. Harita dünya görünümünde kalacaktır.");
        enableMapControls();
    });
} else {
    // Geolocation desteklenmiyorsa
    alert("Tarayıcınız konum servislerini desteklemiyor.");
    enableMapControls();
}


// 3. 3D Küre Üzerinde Animasyonlu Uçuş (Fly To) Fonksiyonu
function flyToLocation(lat, lon) {
    // 50000 metre (50 km) yükseklikten başla
    const destination = Cesium.Cartesian3.fromDegrees(lon, lat, 50000); 

    viewer.camera.flyTo({
        destination: destination,
        duration: 7.0, 
        complete: function() {
            console.log("3D Yakınlaştırma tamamlandı!");

            // Konuma bir işaretçi (Entity) ekle
            viewer.entities.add({
                position: Cesium.Cartesian3.fromDegrees(lon, lat),
                point: {
                    pixelSize: 10,
                    color: Cesium.Color.RED,
                    outlineColor: Cesium.Color.WHITE,
                    outlineWidth: 2
                },
                label: {
                    text: 'Konumunuz Burası!',
                    font: '14pt sans-serif',
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    pixelOffset: new Cesium.Cartesian2(0, -9)
                }
            });

            // Kullanıcı girişlerini tekrar aktif et
            enableMapControls();

            // Biraz daha yakınlaşma animasyonu ekle (1 km yüksekliğe)
             viewer.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(lon, lat, 1000), 
                duration: 2.0 
             });
        }
    });
}

// 4. Kullanıcı Kontrollerini Aktif Etme Fonksiyonu
function enableMapControls() {
    viewer.scene.screenSpaceCameraController.enableInputs = true;
}
// script.js dosyanızın en üstüne, viewer oluşturulduktan sonra ekleyin:
viewer.scene.globe.showGroundAtmosphere = true; // Atmosfer ekler (daha estetik)
viewer.scene.screenSpaceCameraController.maximumZoomDistance = 40000000; // Maksimum zoom mesafesini kısıtlar

// TÜM KREDİLERİ KALDIRMAK İÇİN (Telif hakkı uyarısı!)
viewer.scene.frameState.creditDisplay.container.style.display = 'none';