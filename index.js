let slides_per_view = 5;
let series_len = series.map(e => e.stations.length)
let total_len = series_len.reduce((partialSum, a) => partialSum + a, 0);
let series_flattened = series.map(serie => serie.stations).flat();

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


for (let serie of series) {
    for (let station of serie.stations) {
        document.getElementById('swiper-wrapper').innerHTML += `
        <div class="swiper-slide">
        <img src="image_output/${serie.name}/${station.name}.png">
        </div>
        `
        if (!station.link) {
            document.getElementById('audios').innerHTML += `
            <audio controls style="display: none;" id="audio_${station.name}"  preload="none">
                <source src="https://dl.dropboxusercontent.com/s/ise44wij0b3hcz9/Flash%20FM?dl=0" type="audio/mpeg" />
            </audio>
            `
        } else {
            document.getElementById('audios').innerHTML += `
            <audio controls style="display: none;" id="audio_${station.name}"  preload="none">
                <source src="${station.link}" type="audio/mpeg" />
            </audio>
            `
        }

    }

}

var swiper = new Swiper(".swiper", {
    slidesPerView: slides_per_view,
    spaceBetween: 0,
    centeredSlides: true,
    loop: true
});
    
swiper.on('activeIndexChange', async function () {
    let active = swiper.activeIndex
    let preload_list = [active - 3, active - 2, active -1, active + 1, active + 2, active + 3, active + 4]
    localStorage.setItem("last_index", active)

    let mapped_active = active >= total_len ? active - total_len : active;
    let shifted_active = mapped_active - slides_per_view;
    shifted_active += shifted_active < 0 ? total_len : 0;
    let current_active_object = series_flattened[shifted_active];

    let mapped_preload = preload_list.map(i => i >= total_len ? i - total_len : i);
    let shifted_preload = mapped_preload.map(i => i - slides_per_view);
    shifted_preload = shifted_preload.map(i => i + (i < 0 ? total_len : 0));
    let preload_objects = shifted_preload.map(i => series_flattened[i]);

    for (let last_audio of document.querySelectorAll('audio')) {
        last_audio.pause();
    }
    
    for (let preload_object of preload_objects) {
        let audio_for_preload = document.getElementById(`audio_${preload_object.name}`)
        audio_for_preload.load();
    }

    let audio = document.getElementById(`audio_${current_active_object.name}`)
    audio.play();

    let wait_counter = 0;
    while (!audio.duration) {
        wait_counter += 1;
        await sleep(5);
        if (wait_counter >= 2000) {
            break;
        }
    }
    let station_duration = Math.floor(audio.duration);
    let current_millis = (new Date()).getTime();
    let current_seconds = Math.floor(current_millis / 1000);
    let calculated_time = current_seconds % station_duration;
    audio.currentTime = calculated_time?calculated_time:0;

 });
let last_user_index = localStorage.getItem("last_index");
if (!last_user_index) {
    last_user_index = 15; //K Rose, ofc
    localStorage.setItem("last_index", last_user_index)
}

function run() {
    swiper.slideTo(last_user_index);
}
    
document.getElementById('overlay').addEventListener("click", () => {
    
    document.getElementById('overlay').style.opacity = 0
    setTimeout(() => {
        document.getElementById('overlay').style.display = "none";
    }, 1000);
    run();
})