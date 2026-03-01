package in.codinggurus.banquetease;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(OfflinePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
