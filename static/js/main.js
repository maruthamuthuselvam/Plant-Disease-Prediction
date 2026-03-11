$(document).ready(function () {
    // Initial Setup
    $('.image-section').hide();
    $('.loader-container').hide();
    $('#resultContainer').hide();
    $('.action-buttons').hide();

    // Helper Function: Read Image URL & Show Preview
    function readURL(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                $('#imagePreview').css('background-image', 'url(' + e.target.result + ')');
                $('.upload-zone').hide(); // Hide the drop area
                $('.image-section').fadeIn(650); // Show image section
                $('.action-buttons').fadeIn(650);
            }
            reader.readAsDataURL(input.files[0]);
        }
    }

    // Trigger on File Input Change
    $("#imageUpload").change(function () {
        $('#resultContainer').hide();
        $('#resultText').text('');
        readURL(this);
    });

    // Handle Drag & Drop Events
    const dropZone = $('.upload-zone');
    
    dropZone.on('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).addClass('dragover');
    });

    dropZone.on('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).removeClass('dragover');
    });

    dropZone.on('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).removeClass('dragover');
        
        const files = e.originalEvent.dataTransfer.files;
        if (files.length) {
            $("#imageUpload").prop("files", files); // Update the file input
            $("#imageUpload").trigger("change"); // Trigger change event manually
        }
    });

    // Handle Reset / Choose Another Button
    $('#btn-reset').click(function () {
        $('#imageUpload').val('');
        $('.image-section').hide();
        $('.action-buttons').hide();
        $('#resultContainer').hide();
        $('.upload-zone').fadeIn(400);
    });

    // Predict Button Logic
    $('#btn-predict').click(function () {
        var fileInput = $('#imageUpload')[0];
        if (!fileInput.files.length) {
            alert("Please select or drop an image first.");
            return;
        }

        var form_data = new FormData($('#upload-file')[0]);

        // Show loading animation and disable button
        var $btn = $(this);
        $btn.prop('disabled', true);
        $btn.html('<span>Analyzing...</span><i class="fa-solid fa-spinner fa-spin ms-2"></i>');
        
        $('.loader-container').fadeIn(400);
        $('#resultContainer').hide();

        // Make prediction by calling API
        $.ajax({
            type: 'POST',
            url: '/predict',
            data: form_data,
            contentType: false,
            cache: false,
            processData: false,
            async: true,
            success: function (data) {
                // Return state
                $('.loader-container').hide();
                $btn.prop('disabled', false);
                $btn.html('<span>Analyze Image</span><i class="fa-solid fa-wand-magic-sparkles ms-2"></i>');

                // data format: Predicted Crop: Apple | Predicted Disease: Apple Scab
                // Let's format it to look better in the UI, highlighting the disease part
                if(data.includes("|")) {
                    var parts = data.split("|");
                    var cropText = parts[0].replace('Predicted Crop:', '').trim();
                    var diseaseText = parts[1].replace('Predicted Disease:', '').trim();
                    
                    var formattedHTML = `Crop: <span class="result-highlight">${cropText}</span><br>Disease: <span class="result-highlight">${diseaseText}</span>`;
                    $('#resultText').html(formattedHTML);
                } else {
                    $('#resultText').text(data);
                }

                $('#resultContainer').fadeIn(600);
                console.log('Prediction Success!');
            },
            error: function (err) {
                $('.loader-container').hide();
                $btn.prop('disabled', false);
                $btn.html('<span>Analyze Image</span><i class="fa-solid fa-wand-magic-sparkles ms-2"></i>');
                
                $('#resultText').html('<span class="text-danger">Failed to connect or analyze image. Please try again.</span>');
                $('#resultContainer').fadeIn(600);
            }
        });
    });
});