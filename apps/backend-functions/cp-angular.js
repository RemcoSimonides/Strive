const fs = require('fs-extra');

(async() => {

    const serverSrc = './dist/apps/journal/server';
    const serverCopy = './dist/apps/backend-functions/dist/apps/journal/server';
    const browserSrc = './dist/apps/journal/browser';
    const browserCopy = './dist/apps/backend-functions/dist/apps/journal/browser';

    await fs.remove(serverCopy);
    await fs.copy(serverSrc, serverCopy);

    await fs.remove(browserCopy);
    await fs.copy(browserSrc, browserCopy);

})();