import fetch from 'node-fetch';

async function testAPIUpload() {
  try {
    console.log('🧪 Testing API upload endpoint...\n');
    
    // Test health endpoint first
    console.log('1️⃣  Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:3001/api/health');
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('   ✅ Health check passed:', healthData);
    } else {
      console.log('   ❌ Health check failed:', healthResponse.status);
      return;
    }
    console.log('');

    // Test upload URL generation
    console.log('2️⃣  Testing upload URL generation...');
    const uploadResponse = await fetch('http://localhost:3001/api/generate-upload-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fileName: 'api-test.txt',
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
      
      // Test actual upload
      console.log('3️⃣  Testing actual file upload...');
      const testContent = `API Test Content - ${new Date().toISOString()}`;
      
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
        console.log('4️⃣  Testing file access...');
        const accessResponse = await fetch(uploadData.publicUrl);
        
        if (accessResponse.ok) {
          const downloadedContent = await accessResponse.text();
          console.log('   ✅ File is publicly accessible');
          console.log('   Content matches:', downloadedContent === testContent);
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
    console.log('🎉 API upload test completed!');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

testAPIUpload(); 