// Handles form-submit by preparing to process response
function handleSubmit() {
    var form = window.openForm || document.getElementById('openForm');

    if (window.parent.openNew && window.parent.baseUrl != null) {
        window.parent.openFile.setConsumer(null);
        window.parent.open(window.parent.baseUrl);
    }

    // NOTE: File is loaded via JS injection into the iframe, which in turn sets the
    // file contents in the parent window. The new window asks its opener if any file
    // contents are available or waits for the contents to become available.
    return true;
};

// Hides this dialog
function hideWindow(cancel) {
    window.parent.openFile.cancel(cancel);
}

function fileChanged() {
    var supportedText = document.getElementById('openSupported');
    var form = window.openForm || document.getElementById('openForm');
    var openButton = document.getElementById('openButton');

    if (form.upfile.value.length > 0) {
        openButton.removeAttribute('disabled');
    } else {
        openButton.setAttribute('disabled', 'disabled');
    }
}

function main() {
    if (window.parent.Editor.useLocalStorage) {
        document.body.innerHTML = '';
        var div = document.createElement('div');
        div.style.fontFamily = 'Arial';

        var keys = [];

        for (var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i);
            var value = localStorage.getItem(key);

            if (key.length > 0 && key.charAt(0) != '.' && value.length > 0 &&
                (value.substring(0, 8) === '<mxfile ' || value.substring(0, 11) === '<mxlibrary>' ||
                    value.substring(0, 5) === '<?xml') || value.substring(0, 12) === '<!--[if IE]>') {
                keys.push(key);
            }
        }

        if (keys.length == 0) {
            window.parent.mxUtils.write(div, window.parent.mxResources.get('noFiles'));
            window.parent.mxUtils.br(div);
        } else {
            // Sorts the array by filename (key)
            keys.sort(function (a, b) {
                return a.toLowerCase().localeCompare(b.toLowerCase());
            });

            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];

                // Ignores "dot" files and dropbox cookies
                if (key.length > 0) {
                    var link = document.createElement('a');
                    link.style.fontDecoration = 'none';
                    link.style.fontSize = '14pt';

                    window.parent.mxUtils.write(link, key);
                    link.setAttribute('href', 'javascript:void(0);');
                    div.appendChild(link);

                    var img = document.createElement('span');
                    img.className = 'geSprite geSprite-delete';
                    img.style.position = 'relative';
                    img.style.cursor = 'pointer';
                    img.style.display = 'inline-block';
                    img.style.cssFloat = 'right';
                    img.style.styleFloat = 'right';
                    img.style.paddingRight = '20px';
                    div.appendChild(img);

                    window.parent.mxUtils.br(div);

                    window.parent.mxEvent.addListener(img, 'click', (function (k) {
                        return function () {
                            if (window.parent.mxUtils.confirm(window.parent.mxResources.get('delete') + ' "' + k + '"?')) {
                                localStorage.removeItem(k);
                                window.location.reload();
                            }
                        };
                    })(key));

                    window.parent.mxEvent.addListener(link, 'click', (function (k) {
                        return function () {
                            if (window.parent.openNew && window.parent.baseUrl != null) {
                                var of = window.parent.openFile;
                                var data = localStorage.getItem(k);

                                window.parent.openWindow(window.parent.baseUrl + '#L' + encodeURIComponent(k), function () {
                                    of.cancel(false);
                                }, function () {
                                    of.setData(data, k);
                                });
                            } else {
                                window.parent.openFile.setData(localStorage.getItem(k), k);
                            }
                        };
                    })(key));
                }
            }
        }

        window.parent.mxUtils.br(div);

        var closeButton = window.parent.mxUtils.button(window.parent.mxResources.get('close'), function () {
            hideWindow(true);
        });
        closeButton.className = 'geBtn';
        div.appendChild(closeButton);

        document.body.appendChild(div);
    } else {
        var editLink = document.getElementById('editLink');
        var openButton = document.getElementById('openButton');
        openButton.value = window.parent.mxResources.get(window.parent.openKey || 'open');
        var closeButton = document.getElementById('closeButton');
        closeButton.value = window.parent.mxResources.get('close');
        var supportedText = document.getElementById('openSupported');
        supportedText.innerHTML = window.parent.mxResources.get('openSupported');
        var form = window.openForm || document.getElementById('openForm');

        form.setAttribute('action', window.parent.OPEN_URL);
    }
}