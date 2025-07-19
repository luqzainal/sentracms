import fetch from 'node-fetch';

async function testFrontendUpload() {
  try {
    console.log('🧪 Testing frontend upload simulation...\n');
    
    // Test upload URL generation (like frontend does)
    console.log('1️⃣  Testing upload URL generation from frontend...');
    const uploadResponse = await fetch('http://localhost:3000/api/generate-upload-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fileName: 'frontend-test.txt',
        fileType: 'text/plain'
      })
    });

    if (uploadResponse.ok) {
      const uploadData = await uploadResponse.json();
      console.log('   ✅ Upload URL generated successfully');
      console.log('   File name:', uploadData.fileName);
      console.log('   Upload URL length:', uploadData.uploadUrl.length);
      console.log('   Public URL:', uploadData.publicUrl);
      console.log('');
      
      // Test actual file upload (like frontend does)
      console.log('2️⃣  Testing actual file upload (frontend style)...');
      const testContent = `Frontend Test Content - ${new Date().toISOString()}`;
      
      const fileUploadResponse = await fetch(uploadData.uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'text/plain',
          'cache-control': 'public, max-age=31536000'
        },
        body: testContent
      });

      if (fileUploadResponse.ok) {
        console.log('   ✅ File uploaded successfully');
        console.log('   Status:', fileUploadResponse.status);
        
        // Test file access
        console.log('3️⃣  Testing file access...');
        const accessResponse = await fetch(uploadData.publicUrl);
        
        if (accessResponse.ok) {
          const downloadedContent = await accessResponse.text();
          console.log('   ✅ File is publicly accessible');
          console.log('   Content matches:', downloadedContent === testContent);
          console.log('   Downloaded content length:', downloadedContent.length);
        } else {
          console.log('   ❌ File access denied:', accessResponse.status);
        }
      } else {
        console.log('   ❌ File upload failed:', fileUploadResponse.status);
        const errorText = await fileUploadResponse.text();
        console.log('   Error:', errorText);
      }
    } else {
      console.log('   ❌ Upload URL generation failed:', uploadResponse.status);
      const errorText = await uploadResponse.text();
      console.log('   Error:', errorText);
    }
    
    console.log('');
    console.log('🎉 Frontend upload test completed!');
    
  } catch (error) {
    console.error('❌ Frontend test failed:', error.message);
  }
}

testFrontendUpload(); 