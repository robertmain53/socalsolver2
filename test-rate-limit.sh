#!/bin/bash

echo "🚀 SoCalSolver - Gemini Rate Limit Tester & Waiter"
echo "================================================="

# Carica variabili ambiente
source .env 2>/dev/null || true

if [ -z "$GEMINI_API_KEY" ]; then
    echo "❌ GEMINI_API_KEY not found in .env"
    exit 1
fi

GEMINI_URL="https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=$GEMINI_API_KEY"

# Funzione per testare Gemini
test_gemini() {
    echo "🧪 Testing Gemini API..."
    
    response=$(curl -s -w "%{http_code}" -o /tmp/gemini_response.json \
        -X POST "$GEMINI_URL" \
        -H 'Content-Type: application/json' \
        -d '{
            "contents": [{
                "parts": [{"text": "Test"}]
            }],
            "generationConfig": {
                "maxOutputTokens": 10
            }
        }')
    
    http_code="${response: -3}"
    
    case $http_code in
        200)
            echo "✅ Gemini API working - Rate limit cleared!"
            return 0
            ;;
        429)
            echo "⏰ Rate limit still active (HTTP 429)"
            return 1
            ;;
        403)
            echo "❌ API Key invalid or quota exceeded (HTTP 403)"
            return 2
            ;;
        *)
            echo "❌ Unknown error (HTTP $http_code)"
            cat /tmp/gemini_response.json 2>/dev/null || echo "No response body"
            return 3
            ;;
    esac
}

# Funzione per aspettare con countdown
wait_with_countdown() {
    local minutes=$1
    local seconds=$((minutes * 60))
    
    echo "⏳ Waiting $minutes minutes for rate limit to reset..."
    
    for ((i=seconds; i>0; i--)); do
        mins=$((i / 60))
        secs=$((i % 60))
        printf "\r⏰ Time remaining: %02d:%02d" $mins $secs
        sleep 1
    done
    echo ""
}

# Test iniziale
echo "🔍 Checking current Gemini API status..."
test_gemini
initial_status=$?

case $initial_status in
    0)
        echo ""
        echo "🎉 GREAT NEWS! Gemini API is ready to use."
        echo "🚀 You can now run: node automation.js"
        exit 0
        ;;
    1)
        echo ""
        echo "⚠️  RATE LIMIT DETECTED"
        echo "📊 You've hit Gemini's rate limit from previous usage"
        echo ""
        echo "🤔 What would you like to do?"
        echo "1) Wait 15 minutes and retry (recommended)"
        echo "2) Wait 1 hour and retry (safe option)"
        echo "3) Check status every 5 minutes"
        echo "4) Exit and try later manually"
        read -p "Choose option (1-4): " choice
        ;;
    2)
        echo ""
        echo "❌ API KEY PROBLEM"
        echo "🔑 Your Gemini API key might be:"
        echo "   • Invalid or expired"
        echo "   • Daily quota exceeded (1500 requests/day)"
        echo "   • Billing required for higher limits"
        echo ""
        echo "💡 Solutions:"
        echo "   • Check your API key at: https://makersuite.google.com/app/apikey"
        echo "   • Wait until tomorrow if daily quota exceeded"
        echo "   • Upgrade to paid tier for higher limits"
        exit 1
        ;;
    *)
        echo "❌ Unknown error occurred"
        exit 1
        ;;
esac

# Gestisci le opzioni per rate limit
case $choice in
    1)
        echo ""
        echo "⏳ OPTION 1: Waiting 15 minutes..."
        wait_with_countdown 15
        
        echo "🧪 Testing again..."
        test_gemini
        if [ $? -eq 0 ]; then
            echo "✅ Rate limit cleared! Ready to go!"
            echo "🚀 Run: node automation.js"
        else
            echo "⚠️  Still rate limited. Try waiting longer or use option 2."
        fi
        ;;
    2)
        echo ""
        echo "⏳ OPTION 2: Waiting 1 hour (safe option)..."
        wait_with_countdown 60
        
        echo "🧪 Testing again..."
        test_gemini
        if [ $? -eq 0 ]; then
            echo "✅ Rate limit cleared! Ready to go!"
            echo "🚀 Run: node automation.js"
        else
            echo "⚠️  Still rate limited. You might need to wait until tomorrow."
        fi
        ;;
    3)
        echo ""
        echo "⏳ OPTION 3: Checking every 5 minutes..."
        echo "   (Press Ctrl+C to stop)"
        
        while true; do
            wait_with_countdown 5
            echo "🧪 Testing Gemini API..."
            test_gemini
            if [ $? -eq 0 ]; then
                echo ""
                echo "🎉 RATE LIMIT CLEARED!"
                echo "🚀 You can now run: node automation.js"
                break
            else
                echo "⏰ Still rate limited, checking again in 5 minutes..."
            fi
        done
        ;;
    4)
        echo ""
        echo "👋 Okay, check back later!"
        echo "💡 You can test anytime with: ./test-rate-limit.sh"
        exit 0
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

# Cleanup
rm -f /tmp/gemini_response.json

echo ""
echo "✅ Test completed!"
echo "🚀 If ready, run: node automation.js"
