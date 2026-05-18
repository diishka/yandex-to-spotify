(async () => {

    const sleep = (ms) => new Promise(r => setTimeout(r, ms));

    const scroller = document.querySelector(
        '[data-virtuoso-scroller="true"]'
    );

    if (!scroller) {
        console.error("Scroller not found");
        return;
    }

    console.log("Yandex Music exporter started");

    const collected = new Set();

    let stableRounds = 0;
    let lastCount = 0;
    let rounds = 0;

    async function collectVisibleTracks() {

        const items = document.querySelectorAll('.Meta_root__R8n1h');

        items.forEach(el => {

            const title = el.querySelector('.Meta_title__GGBnH')
                ?.innerText
                ?.trim();

            const artists = [...el.querySelectorAll('.Meta_artistCaption__JESZi')]
                .map(a => a.innerText.trim())
                .join(', ');

            if (!title || !artists) return;

            collected.add(`${artists} - ${title}`);
        });
    }

    while (stableRounds < 20) {

        rounds++;

        await collectVisibleTracks();

        const beforeScroll = scroller.scrollTop;

        scroller.scrollTop += 900;

        await sleep(1800);

        await collectVisibleTracks();

        console.log(
            `Round: ${rounds} | Tracks: ${collected.size} | Scroll: ${Math.floor(scroller.scrollTop)}`
        );

        if (collected.size === lastCount) {
            stableRounds++;
        } else {
            stableRounds = 0;
        }

        lastCount = collected.size;

        if (scroller.scrollTop === beforeScroll) {
            stableRounds++;
        }
    }

    const tracks = [...collected];

    tracks.sort();

    console.log(`Finished. Total tracks: ${tracks.length}`);

    const txtBlob = new Blob(
        [tracks.join('\n')],
        { type: 'text/plain;charset=utf-8' }
    );

    const txtLink = document.createElement('a');

    txtLink.href = URL.createObjectURL(txtBlob);
    txtLink.download = 'yandex_playlist.txt';

    document.body.appendChild(txtLink);

    txtLink.click();

    txtLink.remove();

    const jsonBlob = new Blob(
        [JSON.stringify(tracks, null, 2)],
        { type: 'application/json' }
    );

    const jsonLink = document.createElement('a');

    jsonLink.href = URL.createObjectURL(jsonBlob);
    jsonLink.download = 'yandex_playlist_backup.json';

    document.body.appendChild(jsonLink);

    jsonLink.click();

    jsonLink.remove();

    console.log("Files downloaded");

})();
